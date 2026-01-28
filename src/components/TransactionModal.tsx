'use client';

import React, { useState, useEffect } from 'react';
import type { Player } from '@/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'transfer' | 'request';
  targetPlayer: Player | null;
  currentBalance: number;
  onSubmit: (amount: number, message?: string) => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export default function TransactionModal({
  isOpen,
  onClose,
  type,
  targetPlayer,
  currentBalance,
  onSubmit,
}: TransactionModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setMessage('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !targetPlayer) return null;

  const numAmount = parseInt(amount) || 0;
  const isTransfer = type === 'transfer';
  const isValid = numAmount > 0 && (!isTransfer || numAmount <= currentBalance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      if (numAmount <= 0) {
        setError('Please enter a valid amount');
      } else if (isTransfer && numAmount > currentBalance) {
        setError('Insufficient balance');
      }
      return;
    }
    onSubmit(numAmount, message || undefined);
    onClose();
  };

  const handleQuickAmount = (quickAmount: number) => {
    if (isTransfer && quickAmount > currentBalance) {
      setAmount(currentBalance.toString());
    } else {
      setAmount(quickAmount.toString());
    }
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: `linear-gradient(135deg, ${targetPlayer.color}40 0%, ${targetPlayer.color}20 100%)`,
                border: `2px solid ${targetPlayer.color}40`,
              }}
            >
              {targetPlayer.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isTransfer ? 'Send Money' : 'Request Money'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isTransfer ? 'to' : 'from'} {targetPlayer.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount input */}
          <div className="mb-4">
            <label className="block text-slate-400 text-sm mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-500 font-bold">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-4 pl-10 pr-4 text-3xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                autoFocus
              />
            </div>
            {isTransfer && (
              <p className="text-slate-500 text-sm mt-2">
                Your balance: <span className="text-amber-400 font-semibold">${currentBalance.toLocaleString()}</span>
              </p>
            )}
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => handleQuickAmount(quickAmount)}
                disabled={isTransfer && quickAmount > currentBalance}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  isTransfer && quickAmount > currentBalance
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
                }`}
              >
                ${quickAmount.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Message input */}
          <div className="mb-6">
            <label className="block text-slate-400 text-sm mb-2">Message (optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isTransfer ? "For rent..." : "For the property..."}
              maxLength={50}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              isValid
                ? isTransfer
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white shadow-lg shadow-violet-500/30'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isTransfer ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send ${numAmount.toLocaleString() || '0'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Request ${numAmount.toLocaleString() || '0'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
