'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Player, Room, Transaction, ServerToClientEvents, ClientToServerEvents } from '@/types';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connected: boolean;
  room: Room | null;
  currentPlayer: Player | null;
  pendingRequests: Transaction[];
  recentTransactions: Transaction[];
  error: string | null;
  createRoom: (roomName: string, playerName: string, initialBalance: number) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  leaveRoom: () => void;
  transferMoney: (toPlayerId: string, amount: number, message?: string) => void;
  requestMoney: (fromPlayerId: string, amount: number, message?: string) => void;
  respondToRequest: (transactionId: string, accept: boolean) => void;
  editBalance: (playerId: string, newBalance: number) => void;
  clearError: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Get the server URL - same origin since Socket.io runs with Next.js
const getServerUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const serverUrl = getServerUrl();
    console.log('Connecting to socket server:', serverUrl);
    
    const newSocket = io(serverUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Unable to connect to server. Please try again.');
    });

    newSocket.on('room:joined', ({ room: joinedRoom, player }) => {
      setRoom(joinedRoom);
      setCurrentPlayer(player);
      setError(null);
    });

    newSocket.on('room:updated', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setCurrentPlayer(prev => {
        if (!prev) return null;
        const updated = updatedRoom.players.find((p: Player) => p.id === prev.id);
        return updated || prev;
      });
    });

    newSocket.on('room:error', (errorMsg) => {
      setError(errorMsg);
    });

    newSocket.on('player:joined', (player) => {
      setRoom(prev => prev ? { ...prev, players: [...prev.players, player] } : null);
    });

    newSocket.on('player:left', (playerId) => {
      setRoom(prev => prev ? { ...prev, players: prev.players.filter(p => p.id !== playerId) } : null);
    });

    newSocket.on('transaction:completed', (transaction) => {
      setRecentTransactions(prev => [transaction, ...prev].slice(0, 20));
    });

    newSocket.on('transaction:request', (transaction) => {
      setPendingRequests(prev => [...prev, transaction]);
      setRecentTransactions(prev => [transaction, ...prev].slice(0, 20));
    });

    newSocket.on('transaction:response', (transaction) => {
      setPendingRequests(prev => prev.filter(t => t.id !== transaction.id));
      setRecentTransactions(prev => 
        prev.map(t => t.id === transaction.id ? transaction : t)
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = useCallback((roomName: string, playerName: string, initialBalance: number) => {
    if (socket) {
      socket.emit('room:create', { roomName, playerName, initialBalance });
    }
  }, [socket]);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    if (socket) {
      socket.emit('room:join', { roomId, playerName });
    }
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.emit('room:leave');
      setRoom(null);
      setCurrentPlayer(null);
      setPendingRequests([]);
      setRecentTransactions([]);
    }
  }, [socket]);

  const transferMoney = useCallback((toPlayerId: string, amount: number, message?: string) => {
    if (socket) {
      socket.emit('transaction:transfer', { toPlayerId, amount, message });
    }
  }, [socket]);

  const requestMoney = useCallback((fromPlayerId: string, amount: number, message?: string) => {
    if (socket) {
      socket.emit('transaction:request', { fromPlayerId, amount, message });
    }
  }, [socket]);

  const respondToRequest = useCallback((transactionId: string, accept: boolean) => {
    if (socket) {
      socket.emit('transaction:respond', { transactionId, accept });
    }
  }, [socket]);

  const editBalance = useCallback((playerId: string, newBalance: number) => {
    if (socket) {
      socket.emit('balance:edit', { playerId, newBalance });
    }
  }, [socket]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        room,
        currentPlayer,
        pendingRequests,
        recentTransactions,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        transferMoney,
        requestMoney,
        respondToRequest,
        editBalance,
        clearError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
