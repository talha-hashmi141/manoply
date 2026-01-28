'use client';

import React from 'react';
import type { Transaction, Player } from '@/types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  players: Player[];
  currentPlayerId: string;
}

export default function TransactionHistory({
  transactions,
  players,
  currentPlayerId,
}: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>No transactions yet</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-emerald-400';
      case 'rejected':
        return 'text-red-400';
      case 'pending':
        return 'text-amber-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
      {transactions.map((transaction) => {
        const from = players.find(p => p.id === transaction.fromId);
        const to = players.find(p => p.id === transaction.toId);
        
        if (!from || !to) return null;

        const isIncoming = transaction.toId === currentPlayerId && transaction.status === 'accepted';
        const isOutgoing = transaction.fromId === currentPlayerId && transaction.status === 'accepted';
        const isRequest = transaction.type === 'request';

        return (
          <div
            key={transaction.id}
            className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {/* From avatar */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${from.color}40 0%, ${from.color}20 100%)`,
                  }}
                >
                  {from.avatar}
                </div>

                {/* Arrow */}
                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>

                {/* To avatar */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${to.color}40 0%, ${to.color}20 100%)`,
                  }}
                >
                  {to.avatar}
                </div>

                {/* Names */}
                <div className="min-w-0 ml-1">
                  <p className="text-sm text-slate-300 truncate">
                    {from.name} → {to.name}
                  </p>
                  {transaction.message && (
                    <p className="text-xs text-slate-500 truncate italic">
                      {transaction.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Amount and status */}
              <div className="text-right shrink-0 ml-2">
                <div className={`font-bold ${
                  isIncoming ? 'text-emerald-400' : isOutgoing ? 'text-red-400' : 'text-slate-300'
                }`}>
                  {isIncoming ? '+' : isOutgoing ? '-' : ''}${transaction.amount.toLocaleString()}
                </div>
                <div className={`text-xs flex items-center justify-end gap-1 ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  <span className="capitalize">
                    {isRequest && transaction.status === 'pending' ? 'requested' : transaction.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
