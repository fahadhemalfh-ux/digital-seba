import React, { useState } from 'react';
import {
  Plus,
  X,
  Receipt,
  ShoppingBag,
  CreditCard,
  FileText,
  Coins,
  Calculator,
  Tag,
} from 'lucide-react';

interface FloatingActionButtonProps {
  onOpenSale: () => void;
  onOpenPurchase: () => void;
  onOpenExpense: () => void;
  onOpenMemo: () => void;
  onOpenCashClosing: () => void;
  onOpenRateChart: () => void;
  onOpenCalculator: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onOpenSale,
  onOpenPurchase,
  onOpenExpense,
  onOpenMemo,
  onOpenCashClosing,
  onOpenRateChart,
  onOpenCalculator,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'নতুন বিক্রি এন্ট্রি',
      icon: Receipt,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      onClick: onOpenSale,
    },
    {
      label: 'পণ্য ক্রয় হিসাব',
      icon: ShoppingBag,
      color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      onClick: onOpenPurchase,
    },
    {
      label: 'দৈনিক খরচ লিখুন',
      icon: CreditCard,
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
      onClick: onOpenExpense,
    },
    {
      label: 'ক্যাশ মেমো বানান',
      icon: FileText,
      color: 'bg-teal-600 hover:bg-teal-700 text-white',
      onClick: onOpenMemo,
    },
    {
      label: 'ক্যাশ ড্রয়ার ও নোট গণনা',
      icon: Coins,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      onClick: onOpenCashClosing,
    },
    {
      label: 'ডিজিটাল সেবা রেট চার্ট',
      icon: Tag,
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      onClick: onOpenRateChart,
    },
    {
      label: 'ক্যাশ ক্যালকুলেটর',
      icon: Calculator,
      color: 'bg-slate-700 hover:bg-slate-800 text-white',
      onClick: onOpenCalculator,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end">
      {/* Expanded Menu */}
      {isOpen && (
        <div className="mb-3 space-y-2 flex flex-col items-end animate-in fade-in slide-in-from-bottom-5 duration-200">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.label}
                onClick={() => {
                  act.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-full shadow-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-semibold transition-all hover:scale-105 active:scale-95 group"
              >
                <span className="text-slate-700 group-hover:text-slate-900">{act.label}</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${act.color} shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 ${
          isOpen
            ? 'bg-slate-900 rotate-45'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/30'
        }`}
        title="নতুন এন্ট্রি মেনু"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
