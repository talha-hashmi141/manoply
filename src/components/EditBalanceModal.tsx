'use client';

import React, { useState, useEffect } from 'react';
import type { Player } from '@/types';

interface EditBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onSubmit: (playerId: string, newBalance: number) => void;
}

export default function EditBalanceModal({
  isOpen,
  onClose,
  player,
  onSubmit,
}: EditBalanceModalProps) {
  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (player) {
      setBalance(player.balance.toString());
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBalance = parseInt(balance, 10);
    if (!isNaN(newBalance) && newBalance >= 0) {
      onSubmit(player.id, newBalance);
      onClose();
    }
  };

  const quickAdjustments = [
    { label: '+$100', value: 100 },
    { label: '+$500', value: 500 },
    { label: '+$1000', value: 1000 },
    { label: '-$100', value: -100 },
    { label: '-$500', value: -500 },
    { label: '-$1000', value: -1000 },
  ];

  const handleQuickAdjust = (adjustment: number) => {
    const currentBalance = parseInt(balance, 10) || 0;
    const newBalance = Math.max(0, currentBalance + adjustment);
    setBalance(newBalance.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-slate-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: `linear-gradient(135deg, ${player.color}40 0%, ${player.color}20 100%)`,
                border: `2px solid ${player.color}40`,
              }}
            >
              {player.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Balance</h2>
              <p className="text-sm text-slate-400">{player.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Current balance display */}
          <div className="mb-4 p-3 bg-slate-700/50 rounded-xl">
            <p className="text-sm text-slate-400 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-emerald-400">
              ${player.balance.toLocaleString()}
            </p>
          </div>

          {/* Balance input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Balance
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">$</span>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                min="0"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 pl-10 pr-4 text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Quick adjustments */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-300 mb-2">Quick Adjust</p>
            <div className="grid grid-cols-3 gap-2">
              {quickAdjustments.map((adj) => (
                <button
                  key={adj.label}
                  type="button"
                  onClick={() => handleQuickAdjust(adj.value)}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                    adj.value > 0
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                  }`}
                >
                  {adj.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
