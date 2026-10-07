import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Printer,
  Receipt,
  AlertCircle,
  FileText,
  PlusCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { DateFilterType, ExpenseRecord, PurchaseRecord, SaleRecord, ShopProfile } from '../types';
import {
  formatCurrency,
  formatDisplayDate,
  getTodayDateString,
  isDateInRange,
} from '../utils/helpers';

interface DashboardOverviewProps {
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  expenses: ExpenseRecord[];
  shopProfile: ShopProfile;
  onOpenQuickSale: () => void;
  onOpenQuickPurchase: () => void;
  onOpenQuickExpense: () => void;
  onOpenDigitalMemo: (sale?: SaleRecord) => void;
  onOpenBlankMemo: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  sales,
  purchases,
  expenses,
  shopProfile,
  onOpenQuickSale,
  onOpenQuickPurchase,
  onOpenQuickExpense,
  onOpenDigitalMemo,
  onOpenBlankMemo,
  onNavigateTab,
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [customStart, setCustomStart] = useState<string>(getTodayDateString());
  const [customEnd, setCustomEnd] = useState<string>(getTodayDateString());

  // Filter lists based on dateFilter
  const filteredSales = sales.filter((s) =>
    isDateInRange(s.date, dateFilter, customStart, customEnd)
  );
  const filteredPurchases = purchases.filter((p) =>
    isDateInRange(p.date, dateFilter, customStart, customEnd)
  );
  const filteredExpenses = expenses.filter((e) =>
    isDateInRange(e.date, dateFilter, customStart, customEnd)
  );

  // Calculations for filtered period
  const totalSales = filteredSales.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalReceivedCash = filteredSales.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalDueGiven = filteredSales.reduce((acc, curr) => acc + curr.dueAmount, 0);

  const totalPurchases = filteredPurchases.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Net Cash Balance (Received Cash - Purchases - Expenses) or Net Accounting Balance
  const netDailyCash = totalReceivedCash - totalPurchases - totalExpenses;
  const netAccountingBalance = totalSales - totalPurchases - totalExpenses;

  // Total Lifetime Due across all sales in database
  const lifetimeTotalDue = sales.reduce((acc, curr) => acc + curr.dueAmount, 0);

  // Filter labels
  const filterOptions: { id: DateFilterType; label: string }[] = [
    { id: 'today', label: 'আজ (Today)' },
    { id: 'yesterday', label: 'গতকাল (Yesterday)' },
    { id: 'this_week', label: 'এই সপ্তাহ (This Week)' },
    { id: 'this_month', label: 'এই মাস (This Month)' },
    { id: 'all', label: 'সব সময় (All)' },
    { id: 'custom', label: 'কাস্টম তারিখ (Custom)' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and Fast Announcement Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>দোকানের সার্বিক হিসাব ও ড্যাশবোর্ড</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            তারিখ অনুযায়ী ক্রয়, বিক্রয়, খরচ এবং ক্যাশ ইন হ্যান্ডের নিয়মিত বিবরণ।
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDateFilter(opt.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  dateFilter === opt.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0 bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent border-0 p-0 text-xs font-medium text-slate-700 focus:ring-0"
              />
              <span className="text-slate-400">হতে</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent border-0 p-0 text-xs font-medium text-slate-700 focus:ring-0"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs hover:border-emerald-300 transition-all group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3 relative">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {dateFilter === 'today' ? 'আজকের মোট বিক্রি' : 'মোট বিক্রি (বিক্রয়)'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight relative">
            {formatCurrency(totalSales, shopProfile.useBengaliDigits)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 relative">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              ক্যাশ জমা: {formatCurrency(totalReceivedCash, shopProfile.useBengaliDigits)}
            </span>
            <span className="text-slate-400">
              {filteredSales.length} টি মেমো
            </span>
          </div>
        </div>

        {/* Total Purchases Card */}
        <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs hover:border-indigo-300 transition-all group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3 relative">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              {dateFilter === 'today' ? 'আজকের কেনাকাটা' : 'মোট ক্রয় (মাল কেনা)'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight relative">
            {formatCurrency(totalPurchases, shopProfile.useBengaliDigits)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 relative">
            <span className="text-indigo-600 font-medium">স্টক ও মহাজন চালান</span>
            <span className="text-slate-400">{filteredPurchases.length} টি ভাউচার</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-xs hover:border-rose-300 transition-all group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3 relative">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              {dateFilter === 'today' ? 'আজকের মোট খরচ' : 'মোট দোকান খরচ'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight relative">
            {formatCurrency(totalExpenses, shopProfile.useBengaliDigits)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 relative">
            <span className="flex items-center gap-1 text-rose-600 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              দোকান ভাড়া, নাস্তা ও বিল
            </span>
            <span className="text-slate-400">{filteredExpenses.length} টি খরচ</span>
          </div>
        </div>

        {/* Net Daily Balance / Profit Card */}
        <div className={`p-5 rounded-xl border shadow-xs transition-all group relative overflow-hidden ${
          netDailyCash >= 0
            ? 'bg-gradient-to-br from-teal-50 to-emerald-50/50 border-teal-200'
            : 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-3 relative">
            <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              netDailyCash >= 0 ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {dateFilter === 'today' ? 'আজকের ক্যাশ ব্যালেন্স' : 'নিট ব্যালেন্স / লাভ'}
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              netDailyCash >= 0 ? 'bg-teal-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight relative">
            {formatCurrency(netDailyCash, shopProfile.useBengaliDigits)}
          </div>
          <div className="mt-2 text-xs text-slate-600 relative flex items-center justify-between">
            <span>নগদ জমা হতে কেনা ও খরচ বাদে</span>
            <span className="font-semibold text-slate-700">
              {netDailyCash >= 0 ? 'পজিটিভ' : 'ঘাটতি'}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Insight Row (Due given, Total Pending Dues, Quick Actions) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Due Card */}
        <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-900">
                {dateFilter === 'today' ? 'আজকের বকেয়া বিক্রি' : 'এই সময়ের বাকি বিক্রি'}
              </p>
              <p className="text-lg font-bold text-amber-900">
                {formatCurrency(totalDueGiven, shopProfile.useBengaliDigits)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('dues')}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-0.5 underline"
          >
            বাকির খাতা <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Lifetime Dues Outstanding */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-600">সব গ্রাহকের মোট অপরিশোধিত বাকি</p>
            <p className="text-lg font-bold text-rose-600">
              {formatCurrency(lifetimeTotalDue, shopProfile.useBengaliDigits)}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('dues')}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            তাগাদা পাঠান
          </button>
        </div>

        {/* Fast Memo Generators */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-800">ক্যাশ মেমো প্রিন্ট করুন</p>
            <p className="text-[11px] text-slate-500">ডিজিটাল বা হাতে লেখার খালি মেমো</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenDigitalMemo()}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              মেমো
            </button>
            <button
              onClick={onOpenBlankMemo}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-medium flex items-center gap-1 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              খালি মেমো
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities Section (Recent Sales & Purchases) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">সাম্প্রতিক বিক্রয় তালিকা</h3>
            </div>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              সব দেখুন ({sales.length}) <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {sales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 truncate">
                      {sale.customerName || 'খুচরা ক্রেতা'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {sale.memoNo}
                    </span>
                    {sale.dueAmount > 0 ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-medium">
                        বাকি {formatCurrency(sale.dueAmount, shopProfile.useBengaliDigits)}
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-medium">
                        পরিশোধিত
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 mt-0.5 text-[11px] truncate">
                    {sale.items.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{formatDisplayDate(sale.date, shopProfile.useBengaliDigits)}</span>
                    <span>•</span>
                    <span>{sale.time}</span>
                    <span>•</span>
                    <span className="uppercase">{sale.paymentMethod}</span>
                  </p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(sale.grandTotal, shopProfile.useBengaliDigits)}
                  </span>
                  <button
                    onClick={() => onOpenDigitalMemo(sale)}
                    className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded border border-slate-200 transition-colors"
                    title="ক্যাশ মেমো দেখুন ও প্রিন্ট করুন"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {sales.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                কোনো বিক্রির তথ্য পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>

        {/* Recent Purchases & Expenses */}
        <div className="space-y-6">
          {/* Recent Purchases */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">সাম্প্রতিক পণ্য ক্রয় (Stock In)</h3>
              </div>
              <button
                onClick={() => onNavigateTab('purchases')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                সব দেখুন ({purchases.length}) <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {purchases.slice(0, 3).map((pur) => (
                <div
                  key={pur.id}
                  className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{pur.itemName}</p>
                    <p className="text-[11px] text-slate-500">
                      মহাজন: {pur.supplierName} • {formatDisplayDate(pur.date, shopProfile.useBengaliDigits)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-700">
                      {formatCurrency(pur.totalCost, shopProfile.useBengaliDigits)}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase">{pur.paymentMethod}</span>
                  </div>
                </div>
              ))}
              {purchases.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs">কোনো ক্রয়ের তথ্য নেই।</div>
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">সাম্প্রতিক দোকান খরচ</h3>
              </div>
              <button
                onClick={() => onNavigateTab('expenses')}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                সব দেখুন ({expenses.length}) <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {expenses.slice(0, 3).map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{exp.description}</p>
                    <p className="text-[11px] text-slate-500">
                      {formatDisplayDate(exp.date, shopProfile.useBengaliDigits)} • ক্যাটাগরি: {exp.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">
                      {formatCurrency(exp.amount, shopProfile.useBengaliDigits)}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase">{exp.paymentMethod}</span>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs">কোনো খরচের রেকর্ড নেই।</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
