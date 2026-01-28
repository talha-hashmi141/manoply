'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import PlayerCard from '@/components/PlayerCard';
import TransactionModal from '@/components/TransactionModal';
import RequestNotification from '@/components/RequestNotification';
import TransactionHistory from '@/components/TransactionHistory';
import type { Player } from '@/types';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const {
    room,
    currentPlayer,
    pendingRequests,
    recentTransactions,
    error,
    leaveRoom,
    transferMoney,
    requestMoney,
    respondToRequest,
    clearError,
  } = useSocket();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'transfer' | 'request'>('transfer');
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  // Redirect if no room
  useEffect(() => {
    if (!room) {
      router.push('/');
    }
  }, [room, router]);

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen monopoly-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading room...</p>
        </div>
      </div>
    );
  }

  const handleTransfer = (player: Player) => {
    setTargetPlayer(player);
    setModalType('transfer');
    setModalOpen(true);
  };

  const handleRequest = (player: Player) => {
    setTargetPlayer(player);
    setModalType('request');
    setModalOpen(true);
  };

  const handleModalSubmit = (amount: number, message?: string) => {
    if (!targetPlayer) return;
    
    if (modalType === 'transfer') {
      transferMoney(targetPlayer.id, amount, message);
    } else {
      requestMoney(targetPlayer.id, amount, message);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLeave = () => {
    leaveRoom();
    router.push('/');
  };

  const otherPlayers = room.players.filter(p => p.id !== currentPlayer.id);
  const myPendingRequests = pendingRequests.filter(t => t.fromId === currentPlayer.id);

  return (
    <main className="min-h-screen monopoly-bg dice-pattern">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <h1 className="font-bold text-white">{room.name}</h1>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <span className="font-mono tracking-wider">{room.id}</span>
                  {copied ? (
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">{room.players.length}/8</span>
              <button
                onClick={handleLeave}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Leave room"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Current player balance card */}
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${currentPlayer.color}40 0%, ${currentPlayer.color}20 100%)`,
                  border: `2px solid ${currentPlayer.color}60`,
                }}
              >
                {currentPlayer.avatar}
              </div>
              <div>
                <p className="text-slate-400 text-sm">Your Balance</p>
                <p className="text-4xl font-black text-emerald-400 money-glow">
                  ${currentPlayer.balance.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
                {currentPlayer.name}
              </div>
              {room.hostId === currentPlayer.id && (
                <div className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium flex items-center gap-1">
                  <span>👑</span> Host
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending requests for current user */}
        {myPendingRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Pending Requests
              <span className="px-2 py-0.5 bg-amber-500/20 rounded-full text-amber-400 text-xs">
                {myPendingRequests.length}
              </span>
            </h2>
            <div className="space-y-3">
              {myPendingRequests.map((transaction) => (
                <RequestNotification
                  key={transaction.id}
                  transaction={transaction}
                  players={room.players}
                  currentPlayerId={currentPlayer.id}
                  onAccept={() => respondToRequest(transaction.id, true)}
                  onReject={() => respondToRequest(transaction.id, false)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Players grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Players ({room.players.length})
            </h2>
          </div>

          {otherPlayers.length === 0 ? (
            <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-dashed border-slate-600">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <p className="text-slate-400 mb-2">No other players yet</p>
              <p className="text-sm text-slate-500">
                Share the room code <span className="font-mono font-bold text-violet-400">{room.id}</span> with others to join
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {otherPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isCurrentUser={false}
                  isHost={room.hostId === player.id}
                  onTransfer={() => handleTransfer(player)}
                  onRequest={() => handleRequest(player)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Transaction history toggle */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-700/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-semibold text-white">Transaction History</span>
              {recentTransactions.length > 0 && (
                <span className="px-2 py-0.5 bg-slate-700 rounded-full text-slate-400 text-xs">
                  {recentTransactions.length}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showHistory && (
            <div className="p-4 pt-0">
              <TransactionHistory
                transactions={recentTransactions}
                players={room.players}
                currentPlayerId={currentPlayer.id}
              />
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        targetPlayer={targetPlayer}
        currentBalance={currentPlayer.balance}
        onSubmit={handleModalSubmit}
      />
    </main>
  );
}
