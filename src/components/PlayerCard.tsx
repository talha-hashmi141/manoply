'use client';

import React from 'react';
import type { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  isCurrentUser: boolean;
  isHost: boolean;
  onTransfer?: () => void;
  onRequest?: () => void;
}

export default function PlayerCard({
  player,
  isCurrentUser,
  isHost,
  onTransfer,
  onRequest,
}: PlayerCardProps) {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
        isCurrentUser
          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-105'
          : 'hover:scale-[1.02]'
      }`}
      style={{
        background: `linear-gradient(135deg, ${player.color}20 0%, ${player.color}10 100%)`,
        borderLeft: `4px solid ${player.color}`,
      }}
    >
      {/* Decorative pattern */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-10"
        style={{
          background: `radial-gradient(circle at center, ${player.color} 0%, transparent 70%)`,
        }}
      />
      
      {/* Host badge */}
      {isHost && (
        <div className="absolute top-2 right-2 bg-amber-500/90 text-amber-950 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <span>👑</span>
          <span>HOST</span>
        </div>
      )}

      {/* You badge */}
      {isCurrentUser && !isHost && (
        <div className="absolute top-2 right-2 bg-emerald-500/90 text-emerald-950 text-xs font-bold px-2 py-1 rounded-full">
          YOU
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${player.color}40 0%, ${player.color}20 100%)`,
            border: `2px solid ${player.color}40`,
          }}
        >
          {player.avatar}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">
            {player.name}
          </h3>
          {isCurrentUser && (
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className="text-2xl font-black tracking-tight"
                style={{ color: player.color }}
              >
                {formatMoney(player.balance)}
              </span>
            </div>
          )}
          {!isCurrentUser && (
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm">Balance hidden</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons for other players */}
      {!isCurrentUser && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={onTransfer}
            className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send
          </button>
          <button
            onClick={onRequest}
            className="flex-1 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-400 font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Request
          </button>
        </div>
      )}
    </div>
  );
}
