import React, { useState } from 'react';
import { Calculator, X, RotateCcw, ArrowRight } from 'lucide-react';
import { ShopProfile } from '../types';
import { formatCurrency } from '../utils/helpers';

interface QuickCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopProfile: ShopProfile;
}

export const QuickCalculatorModal: React.FC<QuickCalculatorModalProps> = ({
  isOpen,
  onClose,
  shopProfile,
}) => {
  const [display, setDisplay] = useState('0');
  const [customerPaid, setCustomerPaid] = useState<number | ''>('');
  const [billAmount, setBillAmount] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleBtn = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      return;
    }
    if (val === '=') {
      try {
        // Safe evaluation of basic math expressions
        const sanitized = display.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        setDisplay(String(result));
      } catch (e) {
        setDisplay('Error');
      }
      return;
    }

    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const changeToReturn =
    customerPaid && billAmount ? Math.max(0, Number(customerPaid) - Number(billAmount)) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col my-auto border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">হিসাব ও ক্যাশ ক্যালকুলেটর</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Quick Change Calculator (ভাঙতি / ফেরত হিসাব) */}
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-900 text-[11px] block uppercase">
              কাস্টমারকে ফেরত দেওয়ার হিসাব (Change Return)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 block">মোট বিল (৳)</label>
                <input
                  type="number"
                  placeholder="যেমন: 450"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 block">কাস্টমার দিলেন (৳)</label>
                <input
                  type="number"
                  placeholder="যেমন: 500"
                  value={customerPaid}
                  onChange={(e) => setCustomerPaid(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-300 rounded bg-white text-xs font-bold"
                />
              </div>
            </div>

            {customerPaid && billAmount ? (
              <div className="pt-1 flex items-center justify-between font-bold text-emerald-950 border-t border-emerald-200">
                <span>ফেরত দিতে হবে:</span>
                <span className="text-base text-emerald-700">
                  {formatCurrency(changeToReturn, shopProfile.useBengaliDigits)}
                </span>
              </div>
            ) : null}
          </div>

          {/* Standard Calculator Display */}
          <div className="bg-slate-900 text-white p-3 rounded-xl text-right font-mono text-2xl font-bold tracking-wider overflow-x-auto">
            {display}
          </div>

          {/* Calculator Keypad */}
          <div className="grid grid-cols-4 gap-2 font-bold text-sm">
            {['7', '8', '9', '/'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleBtn(btn)}
                className={`py-2.5 rounded-lg border transition-all ${
                  btn === '/' ? 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {btn}
              </button>
            ))}
            {['4', '5', '6', '*'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleBtn(btn)}
                className={`py-2.5 rounded-lg border transition-all ${
                  btn === '*' ? 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {btn === '*' ? '×' : btn}
              </button>
            ))}
            {['1', '2', '3', '-'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleBtn(btn)}
                className={`py-2.5 rounded-lg border transition-all ${
                  btn === '-' ? 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {btn}
              </button>
            ))}
            {['C', '0', '.', '+'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleBtn(btn)}
                className={`py-2.5 rounded-lg border transition-all ${
                  btn === 'C'
                    ? 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200'
                    : btn === '+'
                    ? 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {btn}
              </button>
            ))}
            <button
              onClick={() => handleBtn('=')}
              className="col-span-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border border-emerald-700 font-bold transition-all shadow-xs"
            >
              = (সমান)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
