// Player type
export interface Player {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  color: string;
}

// Room type
export interface Room {
  id: string;
  name: string;
  players: Player[];
  initialBalance: number;
  createdAt: Date;
  hostId: string;
}

// Transaction type
export interface Transaction {
  id: string;
  type: 'transfer' | 'request';
  fromId: string;
  toId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
  message?: string;
}

// Socket Events
export type ServerToClientEvents = {
  'room:joined': (data: { room: Room; player: Player }) => void;
  'room:updated': (room: Room) => void;
  'room:error': (error: string) => void;
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'transaction:completed': (transaction: Transaction) => void;
  'transaction:request': (transaction: Transaction) => void;
  'transaction:response': (transaction: Transaction) => void;
  'balance:updated': (data: { playerId: string; balance: number }) => void;
};

export type ClientToServerEvents = {
  'room:create': (data: { roomName: string; playerName: string; initialBalance: number }) => void;
  'room:join': (data: { roomId: string; playerName: string }) => void;
  'room:leave': () => void;
  'transaction:transfer': (data: { toPlayerId: string; amount: number; message?: string }) => void;
  'transaction:request': (data: { fromPlayerId: string; amount: number; message?: string }) => void;
  'transaction:respond': (data: { transactionId: string; accept: boolean }) => void;
  'balance:edit': (data: { playerId: string; newBalance: number }) => void;
};

// Avatar options
export const AVATARS = [
  '🎩', '🚗', '🐕', '👢', '🚢', '🎀', '💎', '🎲',
  '🏠', '🔑', '💰', '🎭', '🎯', '🏆', '⭐', '🌟'
];

// Player colors
export const PLAYER_COLORS = [
  '#E63946', // Red
  '#2A9D8F', // Teal
  '#E9C46A', // Yellow
  '#264653', // Dark Blue
  '#F4A261', // Orange
  '#9B5DE5', // Purple
  '#00BBF9', // Sky Blue
  '#00F5D4', // Mint
];
