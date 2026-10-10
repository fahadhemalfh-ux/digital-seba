import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  CreditCard,
  Wallet,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { ExpenseRecord, PurchaseRecord, SaleRecord, ShopProfile } from '../types';
import { formatCurrency, toBengaliDigits } from '../utils/helpers';

interface MonthlyComparisonChartProps {
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  expenses: ExpenseRecord[];
  shopProfile: ShopProfile;
}

const MONTH_NAMES_BN = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

const MONTH_NAMES_FULL_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
  sales,
  purchases,
  expenses,
  shopProfile,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [includePurchasesInExpenses, setIncludePurchasesInExpenses] = useState<boolean>(true);

  // Available years from datasets (at least current year)
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([currentYear]);
    sales.forEach((s) => {
      if (s.date) {
        const y = parseInt(s.date.split('-')[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    purchases.forEach((p) => {
      if (p.date) {
        const y = parseInt(p.date.split('-')[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    expenses.forEach((e) => {
      if (e.date) {
        const y = parseInt(e.date.split('-')[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [sales, purchases, expenses, currentYear]);

  // Aggregate monthly data for selected year
  const monthlyData = useMemo(() => {
    // 12 months array (0 = Jan, 11 = Dec)
    const months = Array.from({ length: 12 }, (_, index) => ({
      monthIndex: index,
      monthName: shopProfile.useBengaliDigits
        ? MONTH_NAMES_BN[index]
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
      fullMonthName: MONTH_NAMES_FULL_BN[index],
      revenue: 0,
      shopExpenses: 0,
      stockPurchases: 0,
      totalExpenses: 0,
      profit: 0,
    }));

    // Process Sales (Revenue)
    sales.forEach((sale) => {
      if (!sale.date) return;
      const [yStr, mStr] = sale.date.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      if (y === selectedYear && m >= 0 && m < 12) {
        months[m].revenue += sale.grandTotal || 0;
      }
    });

    // Process Purchases (Stock in)
    purchases.forEach((purchase) => {
      if (!purchase.date) return;
      const [yStr, mStr] = purchase.date.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      if (y === selectedYear && m >= 0 && m < 12) {
        months[m].stockPurchases += purchase.totalCost || 0;
      }
    });

    // Process Expenses (Operating costs)
    expenses.forEach((exp) => {
      if (!exp.date) return;
      const [yStr, mStr] = exp.date.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      if (y === selectedYear && m >= 0 && m < 12) {
        months[m].shopExpenses += exp.amount || 0;
      }
    });

    // Compute totals & profit
    return months.map((m) => {
      const computedExpenses = includePurchasesInExpenses
        ? m.shopExpenses + m.stockPurchases
        : m.shopExpenses;
      return {
        ...m,
        totalExpenses: computedExpenses,
        profit: m.revenue - computedExpenses,
      };
    });
  }, [sales, purchases, expenses, selectedYear, includePurchasesInExpenses, shopProfile.useBengaliDigits]);

  // Year-to-date aggregates
  const yearTotals = useMemo(() => {
    return monthlyData.reduce(
      (acc, curr) => ({
        revenue: acc.revenue + curr.revenue,
        expenses: acc.expenses + curr.totalExpenses,
        profit: acc.profit + curr.profit,
        shopExpenses: acc.shopExpenses + curr.shopExpenses,
        stockPurchases: acc.stockPurchases + curr.stockPurchases,
      }),
      { revenue: 0, expenses: 0, profit: 0, shopExpenses: 0, stockPurchases: 0 }
    );
  }, [monthlyData]);

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      if (!dataPoint) return null;
      const rev = dataPoint.revenue;
      const exp = dataPoint.totalExpenses;
      const net = rev - exp;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[200px]">
          <div className="font-bold border-b border-slate-700/80 pb-1.5 mb-2 flex items-center justify-between text-slate-200">
            <span>{dataPoint.fullMonthName} {shopProfile.useBengaliDigits ? toBengaliDigits(selectedYear) : selectedYear}</span>
            <span className="text-[10px] text-slate-400 font-normal">মাসিক বিবরণী</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                মোট বিক্রি (Revenue):
              </span>
              <span className="font-bold">
                {formatCurrency(rev, shopProfile.useBengaliDigits)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                মোট খরচ (Expenses):
              </span>
              <span className="font-bold">
                {formatCurrency(exp, shopProfile.useBengaliDigits)}
              </span>
            </div>
            {includePurchasesInExpenses && (
              <div className="text-[10px] text-slate-400 pl-4 py-0.5 border-l-2 border-slate-800 my-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>দোকান খরচ:</span>
                  <span>{formatCurrency(dataPoint.shopExpenses, shopProfile.useBengaliDigits)}</span>
                </div>
                <div className="flex justify-between">
                  <span>মাল ক্রয় (স্টক):</span>
                  <span>{formatCurrency(dataPoint.stockPurchases, shopProfile.useBengaliDigits)}</span>
                </div>
              </div>
            )}
            <div className="border-t border-slate-700/80 pt-1.5 mt-1.5 flex items-center justify-between font-bold">
              <span className="text-slate-300">নিট ব্যালেন্স / লাভ:</span>
              <span className={net >= 0 ? 'text-teal-400' : 'text-amber-400'}>
                {formatCurrency(net, shopProfile.useBengaliDigits)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              মাসিক আয় বনাম ব্যয় তুলনামূলক চার্ট ({shopProfile.useBengaliDigits ? toBengaliDigits(selectedYear) : selectedYear})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            চলতি বছরের প্রতি মাসের বিক্রয় (Revenue) ও মোট খরচের (Expenses) লাইভ গ্রাফিক্যাল সামারি।
          </p>
        </div>

        {/* Controls: Year selector & Expense Scope */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">বছর:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              aria-label="বছর নির্বাচন করুন"
              className="bg-transparent font-bold text-slate-800 border-0 p-0 text-xs focus:ring-0 cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {shopProfile.useBengaliDigits ? toBengaliDigits(yr) : yr}
                </option>
              ))}
            </select>
          </div>

          {/* Include purchases toggle */}
          <button
            onClick={() => setIncludePurchasesInExpenses(!includePurchasesInExpenses)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              includePurchasesInExpenses
                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="খরচের মধ্যে পণ্য বা মালামাল ক্রয়ের টাকা অন্তর্ভুক্ত করবেন কিনা"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {includePurchasesInExpenses ? 'দোকান খরচ + মাল কেনা' : 'শুধু দোকান খরচ'}
            </span>
          </button>
        </div>
      </div>

      {/* Year-to-date Mini Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/70 border-b border-slate-100 text-xs">
        <div className="p-3.5 flex items-center justify-between sm:justify-start sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">বছরের মোট বিক্রি (Revenue)</p>
            <p className="text-base font-bold text-emerald-700">
              {formatCurrency(yearTotals.revenue, shopProfile.useBengaliDigits)}
            </p>
          </div>
        </div>

        <div className="p-3.5 flex items-center justify-between sm:justify-start sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100/70 text-rose-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">
              বছরের মোট খরচ {includePurchasesInExpenses ? '(স্টক সহ)' : ''}
            </p>
            <p className="text-base font-bold text-rose-600">
              {formatCurrency(yearTotals.expenses, shopProfile.useBengaliDigits)}
            </p>
          </div>
        </div>

        <div className="p-3.5 flex items-center justify-between sm:justify-start sm:gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            yearTotals.profit >= 0
              ? 'bg-teal-100/70 text-teal-700'
              : 'bg-amber-100/70 text-amber-700'
          }`}>
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">নিট লাভ / ব্যালেন্স (Net)</p>
            <p className={`text-base font-bold ${
              yearTotals.profit >= 0 ? 'text-teal-700' : 'text-amber-700'
            }`}>
              {formatCurrency(yearTotals.profit, shopProfile.useBengaliDigits)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="p-4 sm:p-6">
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              barGap={4}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="monthName"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => {
                  if (val >= 1000) {
                    const formatted = (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
                    return shopProfile.useBengaliDigits ? toBengaliDigits(formatted) : formatted;
                  }
                  return shopProfile.useBengaliDigits ? toBengaliDigits(val) : String(val);
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                formatter={(value) => {
                  if (value === 'revenue') return 'বিক্রি (Revenue)';
                  if (value === 'totalExpenses') {
                    return includePurchasesInExpenses ? 'ব্যয় (দোকান খরচ + মাল ক্রয়)' : 'ব্যয় (দোকান খরচ)';
                  }
                  return value;
                }}
              />
              {/* Revenue Bar: Rich Emerald Green */}
              <Bar
                dataKey="revenue"
                name="revenue"
                fill="#10b981"
                radius={[5, 5, 0, 0]}
                maxBarSize={36}
              />
              {/* Expense Bar: Rich Coral / Rose */}
              <Bar
                dataKey="totalExpenses"
                name="totalExpenses"
                fill="#f43f5e"
                radius={[5, 5, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Helper / Insight Banner */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              সবুজ বার (বিক্রি) ও লাল বার (ব্যয়) তুলনা করে ব্যবসার লাভ-লোকসানের গতিবিধি সহজেই পর্যবেক্ষণ করুন।
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> বিক্রি
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> খরচ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
