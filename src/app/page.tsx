'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [initialBalance, setInitialBalance] = useState(1500);
  const [isLoading, setIsLoading] = useState(false);

  const { connected, room, error, createRoom, joinRoom, clearError } = useSocket();
  const router = useRouter();

  // Navigate when room is joined
  useEffect(() => {
    if (room) {
      router.push(`/room/${room.id}`);
    }
  }, [room, router]);

  // Reset loading on error
  useEffect(() => {
    if (error) {
      setIsLoading(false);
    }
  }, [error]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomName.trim()) return;
    setIsLoading(true);
    clearError();
    createRoom(roomName.trim(), playerName.trim(), initialBalance);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;
    setIsLoading(true);
    clearError();
    joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  };

  const BALANCE_PRESETS = [500, 1000, 1500, 2000, 5000, 10000];

  return (
    <main className="min-h-screen monopoly-bg dice-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 mb-4 animate-float">
            <span className="text-4xl">💰</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Mano<span className="text-emerald-400">ply</span>
          </h1>
          <p className="text-slate-400 mt-2">Money Manager for Monopoly</p>
          
          {/* Connection status */}
          <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-xs font-medium ${
            connected 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            {connected ? 'Connected' : 'Connecting...'}
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-700/50">
          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Home mode - Choose create or join */}
          {mode === 'home' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                disabled={!connected}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/30 disabled:shadow-none"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-lg">Create Room</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>

              <button
                onClick={() => setMode('join')}
                disabled={!connected}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-violet-500/30 disabled:shadow-none"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-lg">Join Room</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>
          )}

          {/* Create mode */}
          {mode === 'create' && (
            <form onSubmit={handleCreate} className="space-y-5">
              <button
                type="button"
                onClick={() => { setMode('home'); clearError(); }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Family Game Night"
                  maxLength={30}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Starting Balance</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {BALANCE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInitialBalance(preset)}
                      className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                        initialBalance === preset
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      ${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(Math.max(0, parseInt(e.target.value) || 0))}
                    min={0}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 pl-8 pr-4 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!connected || isLoading || !playerName.trim() || !roomName.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/30 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Room
                  </>
                )}
              </button>
            </form>
          )}

          {/* Join mode */}
          {mode === 'join' && (
            <form onSubmit={handleJoin} className="space-y-5">
              <button
                type="button"
                onClick={() => { setMode('home'); clearError(); }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-slate-500 uppercase focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!connected || isLoading || !playerName.trim() || roomCode.length !== 6}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/30 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                    </svg>
                    Joining...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Join Room
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Track money transfers in your Monopoly game in real-time ✨
        </p>
      </div>
    </main>
  );
}
