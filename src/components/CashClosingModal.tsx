import React, { useState } from 'react';
import {
  X,
  Coins,
  CheckCircle2,
  Printer,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Save,
  Check,
} from 'lucide-react';
import { CashClosingRecord, ShopProfile } from '../types';
import {
  formatCurrency,
  formatDisplayDate,
  getCurrentTimeString,
  getTodayDateString,
} from '../utils/helpers';

interface CashClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopProfile: ShopProfile;
  todaySystemCash: number;
  onSaveClosingRecord: (record: CashClosingRecord) => void;
  savedClosings: CashClosingRecord[];
}

export const CashClosingModal: React.FC<CashClosingModalProps> = ({
  isOpen,
  onClose,
  shopProfile,
  todaySystemCash,
  onSaveClosingRecord,
  savedClosings,
}) => {
  const [denominations, setDenominations] = useState({
    note1000: 0,
    note500: 0,
    note200: 0,
    note100: 0,
    note50: 0,
    note20: 0,
    note10: 0,
    coin: 0,
  });

  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'counter' | 'history'>('counter');

  if (!isOpen) return null;

  const notesList = [
    { key: 'note1000', label: '১০০০ টাকার নোট', value: 1000, color: 'text-rose-700 bg-rose-50' },
    { key: 'note500', label: '৫০০ টাকার নোট', value: 500, color: 'text-indigo-700 bg-indigo-50' },
    { key: 'note200', label: '২০০ টাকার নোট', value: 200, color: 'text-amber-700 bg-amber-50' },
    { key: 'note100', label: '১০০ টাকার নোট', value: 100, color: 'text-blue-700 bg-blue-50' },
    { key: 'note50', label: '৫০ টাকার নোট', value: 50, color: 'text-emerald-700 bg-emerald-50' },
    { key: 'note20', label: '২০ টাকার নোট', value: 20, color: 'text-teal-700 bg-teal-50' },
    { key: 'note10', label: '১০ টাকার নোট', value: 10, color: 'text-purple-700 bg-purple-50' },
    { key: 'coin', label: '৫/২/১ টাকার কয়েন ও খুচরা', value: 1, color: 'text-slate-700 bg-slate-100' },
  ];

  const updateCount = (key: string, count: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: Math.max(0, count || 0),
    }));
  };

  const totalPhysicalCash =
    denominations.note1000 * 1000 +
    denominations.note500 * 500 +
    denominations.note200 * 200 +
    denominations.note100 * 100 +
    denominations.note50 * 50 +
    denominations.note20 * 20 +
    denominations.note10 * 10 +
    denominations.coin;

  const difference = totalPhysicalCash - todaySystemCash;

  const handleReset = () => {
    setDenominations({
      note1000: 0,
      note500: 0,
      note200: 0,
      note100: 0,
      note50: 0,
      note20: 0,
      note10: 0,
      coin: 0,
    });
    setNotes('');
  };

  const handleSave = () => {
    const record: CashClosingRecord = {
      id: `closing-${Date.now()}`,
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      notes: notes.trim(),
      denominations,
      totalPhysicalCash,
      systemExpectedCash: todaySystemCash,
      difference,
    };
    onSaveClosingRecord(record);
    alert('আজকের ক্যাশ ড্রয়ার হিসাব ও নোট গণনা সফলভাবে সংরক্ষণ করা হয়েছে!');
    setActiveTab('history');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="no-print bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">দৈনিক ক্যাশ ক্লোজিং ও নোট কাউন্টার</h3>
              <p className="text-[11px] text-slate-400">
                দিনের শেষে ক্যাশ ড্রয়ারের নগদ নোট গণনা ও হিসাব মিলানো
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('counter')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'counter' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                নোট কাউন্টার
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'history' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                পূর্বের ইতিহাস ({savedClosings.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 space-y-6 text-xs">
          {activeTab === 'counter' ? (
            <div className="space-y-6">
              {/* Top Compare Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    সিস্টেম অনুযায়ী ক্যাশ
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {formatCurrency(todaySystemCash, shopProfile.useBengaliDigits)}
                  </div>
                  <span className="text-[10px] text-slate-400">বিক্রি জমা - কেনা - খরচ</span>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase">
                    ড্রয়ারে নগদ গণনা
                  </span>
                  <div className="text-xl font-bold text-emerald-900 mt-0.5">
                    {formatCurrency(totalPhysicalCash, shopProfile.useBengaliDigits)}
                  </div>
                  <span className="text-[10px] text-emerald-700">নোট ও কয়েন মিলিয়ে মোট</span>
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    difference === 0
                      ? 'bg-teal-50 border-teal-200 text-teal-900'
                      : difference > 0
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase">
                    {difference === 0 ? 'হিসাব সম্পন্ন' : difference > 0 ? 'উদ্বৃত্ত ক্যাশ' : 'ঘাটতি'}
                  </span>
                  <div className="text-xl font-bold mt-0.5">
                    {difference === 0
                      ? 'সমান (মিল রয়েছে)'
                      : formatCurrency(Math.abs(difference), shopProfile.useBengaliDigits)}
                  </div>
                  <span className="text-[10px]">
                    {difference === 0 ? 'কোনো গরমিল নেই' : difference > 0 ? 'ক্যাশ ড্রয়ারে বেশি আছে' : 'ক্যাশ ড্রয়ারে কম আছে'}
                  </span>
                </div>
              </div>

              {/* Denominations Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 flex justify-between items-center text-xs border-b border-slate-200">
                  <span>নোটের মান ও সংখ্যা</span>
                  <span>মোট টাকা (৳)</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {notesList.map((item) => {
                    const count = (denominations as any)[item.key] || 0;
                    const lineTotal = count * item.value;
                    return (
                      <div
                        key={item.key}
                        className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 w-48">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.color}`}>
                            {item.value === 1 ? 'কয়েন' : `৳ ${item.value}`}
                          </span>
                          <span className="font-medium text-slate-700">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">×</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={count === 0 ? '' : count}
                            onChange={(e) => updateCount(item.key, Number(e.target.value))}
                            className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                          />
                          <span className="text-slate-400 text-xs">টি</span>
                        </div>

                        <div className="w-28 text-right font-bold text-slate-900 text-sm">
                          {formatCurrency(lineTotal, shopProfile.useBengaliDigits)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note / Remarks */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  মন্তব্য / ক্যাশ ক্লোজিং নোট (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বিকাশে ক্যাশ আউট বাকি ২০০ টাকা বা সকালে ক্যাশ ড্রয়ারে জমা ছিল..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>রিসেট করুন</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>আজকের হিসাব সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              {savedClosings.map((closing) => (
                <div
                  key={closing.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {formatDisplayDate(closing.date, shopProfile.useBengaliDigits)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-mono text-[11px]">{closing.time}</span>
                    </div>
                    {closing.notes && (
                      <p className="text-slate-600 text-[11px] mt-1">মন্তব্য: {closing.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-[11px] text-slate-500">ড্রয়ারে ক্যাশ</div>
                      <div className="font-bold text-emerald-700 text-sm">
                        {formatCurrency(closing.totalPhysicalCash, shopProfile.useBengaliDigits)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500">গরমিল / তফাত</div>
                      <div
                        className={`font-bold text-xs ${
                          closing.difference === 0
                            ? 'text-teal-700'
                            : closing.difference > 0
                            ? 'text-blue-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {closing.difference === 0
                          ? 'সমান (মিল)'
                          : formatCurrency(closing.difference, shopProfile.useBengaliDigits)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {savedClosings.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <Coins className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>পূর্বে সংরক্ষিত কোনো ক্যাশ ক্লোজিং পাওয়া যায়নি।</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
