import React from 'react';
import {
  Store,
  Calendar,
  Clock,
  PlusCircle,
  ShoppingBag,
  Receipt,
  FileText,
  Printer,
  Settings,
  LayoutDashboard,
  CreditCard,
  BookOpen,
} from 'lucide-react';
import { ShopProfile } from '../types';
import { formatDisplayDate, getCurrentTimeString, getTodayDateString } from '../utils/helpers';

interface HeaderProps {
  shopProfile: ShopProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickSale: () => void;
  onOpenQuickPurchase: () => void;
  onOpenQuickExpense: () => void;
  onOpenDigitalMemo: () => void;
  onOpenBlankMemo: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  shopProfile,
  activeTab,
  setActiveTab,
  onOpenQuickSale,
  onOpenQuickPurchase,
  onOpenQuickExpense,
  onOpenDigitalMemo,
  onOpenBlankMemo,
  onOpenSettings,
}) => {
  const todayStr = getTodayDateString();
  const currentTime = getCurrentTimeString();

  const navItems = [
    { id: 'dashboard', label: 'ওভারভিউ', icon: LayoutDashboard },
    { id: 'sales', label: 'বিক্রয় হিসাব', icon: Receipt },
    { id: 'purchases', label: 'পণ্য ক্রয়', icon: ShoppingBag },
    { id: 'expenses', label: 'খরচ হিসাব', icon: CreditCard },
    { id: 'dues', label: 'বাকির খাতা', icon: BookOpen },
    { id: 'memo', label: 'ক্যাশ মেমো', icon: FileText },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Bar with Brand & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
          {/* Shop Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  {shopProfile.name}
                </h1>
                {shopProfile.propName && (
                  <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                    প্রো: {shopProfile.propName}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                <span>{shopProfile.address}</span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="font-medium text-slate-700">মোবা: {shopProfile.phone}</span>
                {shopProfile.whatsappNumber && (
                  <>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <a
                      href={`https://wa.me/88${shopProfile.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      title="হোয়াটসঅ্যাপে চ্যাট করুন"
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                      হোয়াটসঅ্যাপ: {shopProfile.whatsappNumber}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Date Display & Fast Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {formatDisplayDate(todayStr, shopProfile.useBengaliDigits)}
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                {currentTime}
              </span>
            </div>

            {/* Fast Trigger Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenQuickSale}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                title="নতুন বিক্রি লিপিবদ্ধ করুন"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>নতুন বিক্রি</span>
              </button>

              <button
                onClick={onOpenQuickPurchase}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-all"
                title="নতুন মাল ক্রয় হিসাব"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">পণ্য ক্রয়</span>
              </button>

              <button
                onClick={onOpenQuickExpense}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-all"
                title="দৈনিক খরচ লিখুন"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">খরচ</span>
              </button>

              <button
                onClick={onOpenBlankMemo}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-all"
                title="হাতে লেখার জন্য খালি ক্যাশ মেমো প্রিন্ট করুন"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">খালি মেমো</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                title="দোকানের সেটিংস ও ব্যাকআপ"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'memo') {
                    onOpenDigitalMemo();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
