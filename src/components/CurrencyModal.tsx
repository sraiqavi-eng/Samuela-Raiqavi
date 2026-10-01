import React, { useState } from 'react';
import { X, Coins, ArrowRightLeft } from 'lucide-react';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({ isOpen, onClose }) => {
  const [fjdAmount, setFjdAmount] = useState<number>(100);
  const [targetCurrency, setTargetCurrency] = useState<string>('USD');

  const exchangeRates: Record<string, { rate: number; symbol: string; name: string }> = {
    USD: { rate: 0.44, symbol: '$', name: 'US Dollar' },
    AUD: { rate: 0.68, symbol: 'A$', name: 'Australian Dollar' },
    NZD: { rate: 0.74, symbol: 'NZ$', name: 'New Zealand Dollar' },
    EUR: { rate: 0.41, symbol: '€', name: 'Euro' },
    GBP: { rate: 0.35, symbol: '£', name: 'British Pound' },
    CAD: { rate: 0.61, symbol: 'C$', name: 'Canadian Dollar' },
    JPY: { rate: 68.5, symbol: '¥', name: 'Japanese Yen' },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700">
            <Coins className="w-5 h-5" />
            <h3 className="font-heading font-extrabold text-lg text-slate-900">
              Quick Currency Converter
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fijian Dollars (FJD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">FJD $</span>
              <input
                type="number"
                value={fjdAmount || ''}
                onChange={(e) => setFjdAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 pl-16 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-base focus:outline-none focus:border-teal-500 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Convert To
            </label>
            <select
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-sm focus:outline-none focus:border-teal-500"
            >
              {Object.entries(exchangeRates).map(([code, info]) => (
                <option key={code} value={code}>
                  {code} - {info.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-emerald-800">Calculated Value:</span>
              <div className="font-heading font-extrabold text-2xl text-emerald-950 tabular-nums">
                {exchangeRates[targetCurrency].symbol}
                {(fjdAmount * exchangeRates[targetCurrency].rate).toFixed(2)}{' '}
                <span className="text-xs font-semibold text-emerald-700">{targetCurrency}</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-emerald-700 font-mono">
              1 FJD ≈ {exchangeRates[targetCurrency].rate} {targetCurrency}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {[20, 50, 100, 200, 500].map(amt => (
              <button
                key={amt}
                onClick={() => setFjdAmount(amt)}
                className="flex-1 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 transition-colors"
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
