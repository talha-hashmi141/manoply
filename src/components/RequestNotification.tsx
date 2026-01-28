'use client';

import React from 'react';
import type { Transaction, Player } from '@/types';

interface RequestNotificationProps {
  transaction: Transaction;
  players: Player[];
  currentPlayerId: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function RequestNotification({
  transaction,
  players,
  currentPlayerId,
  onAccept,
  onReject,
}: RequestNotificationProps) {
  const requester = players.find(p => p.id === transaction.toId);
  const payer = players.find(p => p.id === transaction.fromId);
  
  if (!requester || !payer) return null;

  const isForCurrentUser = transaction.fromId === currentPlayerId;
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const canAfford = currentPlayer && currentPlayer.balance >= transaction.amount;

  return (
    <div
      className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-2xl p-4 animate-pulse-subtle"
    >
      <div className="flex items-start gap-3">
        {/* Requester avatar */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{
            background: `linear-gradient(135deg, ${requester.color}40 0%, ${requester.color}20 100%)`,
            border: `2px solid ${requester.color}40`,
          }}
        >
          {requester.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white">{requester.name}</span>
            <span className="text-slate-400">
              {isForCurrentUser ? 'requested from you' : `requested from ${payer.name}`}
            </span>
          </div>
          
          <div className="text-2xl font-black text-violet-400 mt-1">
            ${transaction.amount.toLocaleString()}
          </div>
          
          {transaction.message && (
            <p className="text-slate-400 text-sm mt-1 italic">
              &ldquo;{transaction.message}&rdquo;
            </p>
          )}

          {/* Action buttons only for the payer */}
          {isForCurrentUser && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={onAccept}
                disabled={!canAfford}
                className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  canAfford
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {canAfford ? 'Pay' : 'Insufficient funds'}
              </button>
              <button
                onClick={onReject}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Decline
              </button>
            </div>
          )}

          {!isForCurrentUser && (
            <div className="mt-2 text-sm text-slate-500">
              Waiting for response...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
