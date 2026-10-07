import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Search,
  Download,
  Calendar,
  X,
  CheckCircle2,
  PieChart,
  Home,
  Zap,
  Coffee,
  Truck,
  Wrench,
  Package,
  Layers,
} from 'lucide-react';
import { ExpenseCategory, ExpenseRecord, ShopProfile } from '../types';
import {
  exportToCSV,
  formatCurrency,
  formatDisplayDate,
  getTodayDateString,
} from '../utils/helpers';

interface ExpenseTrackerProps {
  expenses: ExpenseRecord[];
  onAddExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
  shopProfile: ShopProfile;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  shopProfile,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad'>('cash');

  const categoryMap: Record<
    ExpenseCategory,
    { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
  > = {
    rent: { label: 'দোকান ভাড়া (Shop Rent)', icon: Home, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    utility: { label: 'বিদ্যুৎ ও বিল (Utility)', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    staff: { label: 'কর্মচারী বেতন (Staff Salary)', icon: Coffee, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    food: { label: 'চা-নাস্তা ও খাবার (Food)', icon: Coffee, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    transport: { label: 'যাতায়াত ও পরিবহন (Transport)', icon: Truck, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    supplies: { label: 'সরঞ্জাম ও ব্যাগ (Supplies)', icon: Package, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    maintenance: { label: 'মেরামত ও রক্ষণাবেক্ষণ', icon: Wrench, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    others: { label: 'অন্যান্য দোকান খরচ (Others)', icon: Layers, color: 'text-slate-600 bg-slate-100 border-slate-200' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description.trim()) {
      alert('অনুগ্রহ করে সঠিক খরচের পরিমাণ ও বিবরণ লিখুন!');
      return;
    }

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: date || getTodayDateString(),
      category,
      description: description.trim(),
      amount: Number(amount),
      paymentMethod,
    };

    onAddExpense(newExpense);

    // Reset Form
    setShowForm(false);
    setAmount('');
    setDescription('');
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryMap[e.category]?.label.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCat = selectedCategory === 'all' || e.category === selectedCategory;

    return matchSearch && matchCat;
  });

  const totalExpenseAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Category breakdown calculation
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleExportCSV = () => {
    const csvData = expenses.map((e) => ({
      'আইডি': e.id,
      'তারিখ': e.date,
      'ক্যাটাগরি': categoryMap[e.category]?.label || e.category,
      'বিবরণ': e.description,
      'টাকা': e.amount,
      'পেমেন্ট মাধ্যম': e.paymentMethod,
    }));

    exportToCSV(csvData, `DokanKhata_Expenses_${getTodayDateString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-rose-600" />
            <span>দৈনিক দোকান খরচ ট্র্যাকার (Daily Expense Tracker)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            দোকান ভাড়া, বিদ্যুৎ বিল, কর্মচারীর নাস্তা ও আনুষঙ্গিক ব্যয়ের হিসাব।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>এক্সপোর্ট CSV</span>
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন খরচ এন্ট্রি'}</span>
          </button>
        </div>
      </div>

      {/* Category Overview Badges / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {(Object.keys(categoryMap) as ExpenseCategory[]).slice(0, 6).map((catKey) => {
          const cat = categoryMap[catKey];
          const Icon = cat.icon;
          const sum = categoryTotals[catKey] || 0;
          return (
            <div
              key={catKey}
              onClick={() => setSelectedCategory(selectedCategory === catKey ? 'all' : catKey)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedCategory === catKey
                  ? 'ring-2 ring-rose-500 border-rose-300 bg-rose-50/50'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{cat.label.split('(')[0]}</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {formatCurrency(sum, shopProfile.useBengaliDigits)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expense Entry Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border-2 border-rose-500/30 p-5 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              নতুন খরচের বিবরণ লিপিবদ্ধ করুন
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                খরচের পরিমাণ (টাকা) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                খরচের খাত / ক্যাটাগরি *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                {(Object.keys(categoryMap) as ExpenseCategory[]).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {categoryMap[catKey].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                পেমেন্ট মাধ্যম
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
              >
                <option value="cash">ক্যাশ / নগদ ক্যাশ ড্রয়ার</option>
                <option value="bkash">বিকাশ (bKash)</option>
                <option value="nagad">নগদ (Nagad)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">তারিখ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-600 font-medium mb-1">
              খরচের বিস্তারিত বিবরণ (Description) *
            </label>
            <input
              type="text"
              placeholder="যেমন: কর্মচারীদের দুপুরের খাবার, বিদ্যুৎ বিল পরিশোধ, বা দোকানের পলিথিন ব্যাগ কেনা..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>খরচ সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="খরচের বিবরণ বা খাত খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {(Object.keys(categoryMap) as ExpenseCategory[]).map((catKey) => (
              <option key={catKey} value={catKey}>
                {categoryMap[catKey].label}
              </option>
            ))}
          </select>

          <div className="text-slate-500 font-medium">
            মোট খরচ:{' '}
            <span className="font-bold text-rose-600">
              {formatCurrency(totalExpenseAmount, shopProfile.useBengaliDigits)}
            </span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">তারিখ</th>
                <th className="p-3.5 font-semibold">ক্যাটাগরি</th>
                <th className="p-3.5 font-semibold">খরচের বিবরণ</th>
                <th className="p-3.5 font-semibold text-right">পরিমাণ (টাকা)</th>
                <th className="p-3.5 font-semibold text-center">মাধ্যম</th>
                <th className="p-3.5 font-semibold text-center">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => {
                const catInfo = categoryMap[expense.category] || categoryMap.others;
                const Icon = catInfo.icon;
                return (
                  <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 text-slate-600 font-medium">
                      {formatDisplayDate(expense.date, shopProfile.useBengaliDigits)}
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${catInfo.color}`}>
                        <Icon className="w-3 h-3" />
                        {catInfo.label.split('(')[0]}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-slate-800">
                      {expense.description}
                    </td>

                    <td className="p-3.5 text-right font-bold text-rose-600 text-sm">
                      {formatCurrency(expense.amount, shopProfile.useBengaliDigits)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="inline-block uppercase text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {expense.paymentMethod === 'cash' ? 'নগদ' : expense.paymentMethod}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${expense.description}" খরচের তথ্যটি মুছতে চান?`)) {
                            onDeleteExpense(expense.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    কোনো খরচের রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
