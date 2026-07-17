import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { theme } from '../theme';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
  initialAction?: 'BUY' | 'SELL';
  onSubmit: (order: { symbol: string; action: 'BUY' | 'SELL'; quantity: number; price: number }) => void;
}

export default function OrderModal({
  isOpen,
  onClose,
  symbol,
  currentPrice,
  initialAction = 'BUY',
  onSubmit
}: OrderModalProps) {
  const [action, setAction] = useState<'BUY' | 'SELL'>(initialAction);
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [error, setError] = useState<string | null>(null);

  // reset state on open/action change
  useEffect(() => {
    if (isOpen) {
      setAction(initialAction);
      setQuantity('');
      setPrice(currentPrice.toString());
      setError(null);
    }
  }, [isOpen, initialAction, currentPrice]);

  if (!isOpen) return null;

  const numQuantity = parseFloat(quantity);
  const numPrice = parseFloat(price);

  const isValidQuantity = !isNaN(numQuantity) && numQuantity > 0;
  const isValidPrice = !isNaN(numPrice) && numPrice > 0;

  const grossTotal = (isValidQuantity ? numQuantity : 0) * (isValidPrice ? numPrice : 0);
  const commission = grossTotal * 0.005; // Assume 0.5% commission
  const netTotal = action === 'BUY' ? grossTotal + commission : grossTotal - commission;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidQuantity) {
      setError('Please enter a valid quantity.');
      return;
    }
    if (!isValidPrice) {
      setError('Please enter a valid price.');
      return;
    }
    
    onSubmit({
      symbol,
      action,
      quantity: numQuantity,
      price: numPrice,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-md p-6 rounded-xl border ${theme.colors.border} ${theme.colors.surface} shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${theme.colors.textPrimary} ${theme.fonts.sans}`}>
            Order Ticket - {symbol}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className={`p-1 rounded-md hover:bg-[#21262D] ${theme.colors.textSecondary} hover:text-white transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toggle */}
        <div className="flex p-1 mb-6 rounded-lg bg-[#161B22] border border-border-dark">
          <button
            type="button"
            onClick={() => setAction('BUY')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              action === 'BUY' ? 'bg-[#238636] text-white shadow' : 'text-text-secondary hover:text-white'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setAction('SELL')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              action === 'SELL' ? 'bg-[#DA3633] text-white shadow' : 'text-text-secondary hover:text-white'
            }`}
          >
            SELL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-mono mb-1.5 ${theme.colors.textSecondary} uppercase`}>
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                className={`w-full px-3 py-2 bg-[#0D1117] border ${theme.colors.border} rounded-md text-white focus:outline-none focus:border-[#58A6FF] ${theme.fonts.mono}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-mono mb-1.5 ${theme.colors.textSecondary} uppercase`}>
                Price (BDT)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0.1"
                step="0.1"
                className={`w-full px-3 py-2 bg-[#0D1117] border ${theme.colors.border} rounded-md text-white focus:outline-none focus:border-[#58A6FF] ${theme.fonts.mono}`}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-[#DA3633] bg-[#DA3633]/10 border border-[#DA3633]/30 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Summary Preview */}
          <div className="p-4 rounded-lg bg-[#161B22] border border-border-dark space-y-2 mt-6">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.colors.textSecondary} mb-3`}>
              Transaction Summary
            </h3>
            <div className="flex justify-between items-center text-sm">
              <span className={theme.colors.textSecondary}>Gross Total</span>
              <span className={`font-mono ${theme.colors.textPrimary}`}>
                ৳{grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className={theme.colors.textSecondary}>Commission (0.5%)</span>
              <span className={`font-mono ${theme.colors.textPrimary}`}>
                ৳{commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-t border-border-dark pt-2 mt-2 flex justify-between items-center">
              <span className="font-bold text-white">Net Total</span>
              <span className={`font-mono font-bold ${action === 'BUY' ? theme.colors.negative : theme.colors.positive}`}>
                {action === 'BUY' ? '-' : '+'}৳{netTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full mt-6 py-3 font-bold rounded-md transition-colors ${
              action === 'BUY'
                ? 'bg-[#238636] hover:bg-[#2EA043] text-white'
                : 'bg-[#DA3633] hover:bg-[#F85149] text-white'
            }`}
          >
            {action === 'BUY' ? 'Confirm Buy Order' : 'Confirm Sell Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
