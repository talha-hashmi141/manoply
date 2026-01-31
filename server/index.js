const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Avatar options
const AVATARS = [
  '🎩', '🚗', '🐕', '👢', '🚢', '🎀', '💎', '🎲',
  '🏠', '🔑', '💰', '🎭', '🎯', '🏆', '⭐', '🌟'
];

// Player colors
const PLAYER_COLORS = [
  '#E63946', '#2A9D8F', '#E9C46A', '#264653',
  '#F4A261', '#9B5DE5', '#00BBF9', '#00F5D4',
];

// In-memory storage
const rooms = new Map();
const socketToPlayer = new Map();
const pendingTransactions = new Map();

// Helper functions
function getAvailableAvatarAndColor(room) {
  const usedAvatars = room.players.map(p => p.avatar);
  const usedColors = room.players.map(p => p.color);
  
  const avatar = AVATARS.find(a => !usedAvatars.includes(a)) || AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const color = PLAYER_COLORS.find(c => !usedColors.includes(c)) || PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
  
  return { avatar, color };
}

function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getPlayerInfo(socketId) {
  const info = socketToPlayer.get(socketId);
  if (!info) return null;
  
  const room = rooms.get(info.roomId);
  if (!room) return null;
  
  const player = room.players.find(p => p.id === info.playerId);
  if (!player) return null;
  
  return { room, player };
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create a new room
  socket.on('room:create', ({ roomName, playerName, initialBalance }) => {
    const roomId = generateRoomId();
    const playerId = uuidv4();
    
    const player = {
      id: playerId,
      name: playerName,
      avatar: AVATARS[0],
      balance: initialBalance,
      color: PLAYER_COLORS[0],
    };

    const room = {
      id: roomId,
      name: roomName,
      players: [player],
      initialBalance,
      createdAt: new Date(),
      hostId: playerId,
    };

    rooms.set(roomId, room);
    socketToPlayer.set(socket.id, { roomId, playerId });
    
    socket.join(roomId);
    socket.emit('room:joined', { room, player });
    
    console.log(`Room created: ${roomId} by ${playerName}`);
  });

  // Join existing room
  socket.on('room:join', ({ roomId, playerName }) => {
    const normalizedRoomId = roomId.toUpperCase();
    const room = rooms.get(normalizedRoomId);
    
    if (!room) {
      socket.emit('room:error', 'Room not found. Please check the room code.');
      return;
    }

    if (room.players.length >= 8) {
      socket.emit('room:error', 'Room is full (max 8 players).');
      return;
    }

    const { avatar, color } = getAvailableAvatarAndColor(room);
    const playerId = uuidv4();
    
    const player = {
      id: playerId,
      name: playerName,
      avatar,
      balance: room.initialBalance,
      color,
    };

    room.players.push(player);
    socketToPlayer.set(socket.id, { roomId: normalizedRoomId, playerId });
    
    socket.join(normalizedRoomId);
    socket.emit('room:joined', { room, player });
    socket.to(normalizedRoomId).emit('player:joined', player);
    
    console.log(`${playerName} joined room: ${normalizedRoomId}`);
  });

  // Transfer money
  socket.on('transaction:transfer', ({ toPlayerId, amount, message }) => {
    const playerInfo = getPlayerInfo(socket.id);
    if (!playerInfo) {
      socket.emit('room:error', 'Not in a room');
      return;
    }

    const { room, player: sender } = playerInfo;
    const receiver = room.players.find(p => p.id === toPlayerId);

    if (!receiver) {
      socket.emit('room:error', 'Player not found');
      return;
    }

    if (sender.balance < amount) {
      socket.emit('room:error', 'Insufficient balance');
      return;
    }

    if (amount <= 0) {
      socket.emit('room:error', 'Amount must be positive');
      return;
    }

    sender.balance -= amount;
    receiver.balance += amount;

    const transaction = {
      id: uuidv4(),
      type: 'transfer',
      fromId: sender.id,
      toId: receiver.id,
      amount,
      status: 'accepted',
      timestamp: new Date(),
      message,
    };

    io.to(room.id).emit('room:updated', room);
    io.to(room.id).emit('transaction:completed', transaction);

    console.log(`Transfer: ${sender.name} -> ${receiver.name}: $${amount}`);
  });

  // Request money
  socket.on('transaction:request', ({ fromPlayerId, amount, message }) => {
    const playerInfo = getPlayerInfo(socket.id);
    if (!playerInfo) {
      socket.emit('room:error', 'Not in a room');
      return;
    }

    const { room, player: requester } = playerInfo;
    const payer = room.players.find(p => p.id === fromPlayerId);

    if (!payer) {
      socket.emit('room:error', 'Player not found');
      return;
    }

    if (amount <= 0) {
      socket.emit('room:error', 'Amount must be positive');
      return;
    }

    const transaction = {
      id: uuidv4(),
      type: 'request',
      fromId: payer.id,
      toId: requester.id,
      amount,
      status: 'pending',
      timestamp: new Date(),
      message,
    };

    pendingTransactions.set(transaction.id, transaction);
    io.to(room.id).emit('transaction:request', transaction);

    console.log(`Request: ${requester.name} <- ${payer.name}: $${amount}`);
  });

  // Respond to money request
  socket.on('transaction:respond', ({ transactionId, accept }) => {
    const transaction = pendingTransactions.get(transactionId);
    if (!transaction) {
      socket.emit('room:error', 'Transaction not found');
      return;
    }

    const playerInfo = getPlayerInfo(socket.id);
    if (!playerInfo) {
      socket.emit('room:error', 'Not in a room');
      return;
    }

    const { room, player: responder } = playerInfo;
    
    if (responder.id !== transaction.fromId) {
      socket.emit('room:error', 'Only the payer can respond to this request');
      return;
    }

    const payer = room.players.find(p => p.id === transaction.fromId);
    const requester = room.players.find(p => p.id === transaction.toId);

    if (!payer || !requester) {
      socket.emit('room:error', 'Player not found');
      return;
    }

    if (accept) {
      if (payer.balance < transaction.amount) {
        socket.emit('room:error', 'Insufficient balance');
        transaction.status = 'rejected';
      } else {
        payer.balance -= transaction.amount;
        requester.balance += transaction.amount;
        transaction.status = 'accepted';
      }
    } else {
      transaction.status = 'rejected';
    }

    pendingTransactions.delete(transactionId);

    io.to(room.id).emit('transaction:response', transaction);
    io.to(room.id).emit('room:updated', room);

    console.log(`Request ${accept ? 'accepted' : 'rejected'}: ${payer.name} -> ${requester.name}: $${transaction.amount}`);
  });

  // Host edit balance
  socket.on('balance:edit', ({ playerId, newBalance }) => {
    const playerInfo = getPlayerInfo(socket.id);
    if (!playerInfo) {
      socket.emit('room:error', 'Not in a room');
      return;
    }

    const { room, player: editor } = playerInfo;

    // Only host can edit balances
    if (room.hostId !== editor.id) {
      socket.emit('room:error', 'Only the host can edit balances');
      return;
    }

    const targetPlayer = room.players.find(p => p.id === playerId);
    if (!targetPlayer) {
      socket.emit('room:error', 'Player not found');
      return;
    }

    if (newBalance < 0) {
      socket.emit('room:error', 'Balance cannot be negative');
      return;
    }

    const oldBalance = targetPlayer.balance;
    targetPlayer.balance = newBalance;

    io.to(room.id).emit('room:updated', room);
    io.to(room.id).emit('balance:updated', { playerId, balance: newBalance });

    console.log(`Balance edit by host: ${targetPlayer.name} $${oldBalance} -> $${newBalance}`);
  });

  // Leave room
  socket.on('room:leave', () => {
    handleDisconnect();
  });

  function handleDisconnect() {
    const info = socketToPlayer.get(socket.id);
    if (!info) return;

    const room = rooms.get(info.roomId);
    if (!room) {
      socketToPlayer.delete(socket.id);
      return;
    }

    const playerIndex = room.players.findIndex(p => p.id === info.playerId);
    if (playerIndex !== -1) {
      const player = room.players[playerIndex];
      room.players.splice(playerIndex, 1);
      socket.to(info.roomId).emit('player:left', player.id);

      if (room.players.length === 0) {
        rooms.delete(info.roomId);
        console.log(`Room deleted: ${info.roomId}`);
      } else {
        if (room.hostId === player.id) {
          room.hostId = room.players[0].id;
        }
        io.to(info.roomId).emit('room:updated', room);
      }

      console.log(`${player.name} left room: ${info.roomId}`);
    }

    socketToPlayer.delete(socket.id);
    socket.leave(info.roomId);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    handleDisconnect();
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`> Socket.io server running on port ${PORT}`);
});
