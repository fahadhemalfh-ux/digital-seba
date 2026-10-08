import React, { useState } from 'react';
import {
  X,
  Printer,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  FileSpreadsheet,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { RateItem, ShopProfile } from '../types';
import { formatCurrency } from '../utils/helpers';

interface RateChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopProfile: ShopProfile;
  rateList: RateItem[];
  onAddRateItem: (item: RateItem) => void;
  onDeleteRateItem: (id: string) => void;
  onSelectServiceToSale?: (item: RateItem) => void;
}

export const RateChartModal: React.FC<RateChartModalProps> = ({
  isOpen,
  onClose,
  shopProfile,
  rateList,
  onAddRateItem,
  onDeleteRateItem,
  onSelectServiceToSale,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New Item State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RateItem['category']>('photocopy');
  const [unit, setUnit] = useState('পাতা');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('অনুগ্রহ করে সেবার নাম ও মূল্য লিখুন!');
      return;
    }

    const newItem: RateItem = {
      id: `rate-${Date.now()}`,
      name: name.trim(),
      category,
      unit,
      price: Number(price),
      description: description.trim(),
    };

    onAddRateItem(newItem);
    setShowAddForm(false);
    setName('');
    setPrice('');
    setDescription('');
  };

  const filteredRates = rateList.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const categories = [
    { id: 'all', label: 'সকল সেবা' },
    { id: 'photocopy', label: 'ফটোকপি ও লেমিনেশন' },
    { id: 'online', label: 'অনলাইন আবেদন ও সেবা' },
    { id: 'photo', label: 'ছবি ও প্রিন্ট' },
    { id: 'compose', label: 'কম্পিউটার কম্পোজ' },
    { id: 'stationery', label: 'স্টেশনারি ও খাতা-কলম' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">ডিজিটাল সেবা রেট চার্ট ও মূল্য তালিকা</h3>
              <p className="text-[11px] text-slate-400">
                ফটোকপি, অনলাইন আবেদন ও প্রিন্টের অফিসিয়াল রেট লিস্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন সেবা যোগ</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
              title="দেওয়ালে টানানোর জন্য রেট চার্ট প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>রেট চার্ট প্রিন্ট</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print-only Wall Poster Header */}
        <div className="print-only text-center border-b-2 border-slate-900 pb-3 mb-4">
          <h1 className="text-2xl font-black text-slate-900">{shopProfile.name}</h1>
          <p className="text-xs text-slate-700 font-bold mt-0.5">প্রোপ্রাইটর: {shopProfile.propName}</p>
          <p className="text-xs text-slate-600">{shopProfile.address}</p>
          <p className="text-xs font-semibold text-slate-800 mt-0.5">
            মোবাইল: {shopProfile.phone} | হোয়াটসঅ্যাপ: {shopProfile.whatsappNumber}
          </p>
          <div className="inline-block mt-2 px-4 py-1 bg-slate-900 text-white font-bold text-xs uppercase rounded">
            ডিজিটাল সেবা ও স্টেশনারি রেট চার্ট
          </div>
        </div>

        {/* Controls & Search (Hidden in print) */}
        <div className="no-print bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="সেবা বা পণ্যের নাম খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add New Rate Form */}
        {showAddForm && (
          <form
            onSubmit={handleSave}
            className="no-print bg-emerald-50/70 border-b border-emerald-200 p-4 space-y-3 animate-in fade-in text-xs"
          >
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              নতুন সেবার নাম ও মূল্য নির্ধারণ করুন
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-slate-700 font-medium mb-1">সেবার নাম *</label>
                <input
                  type="text"
                  placeholder="যেমন: লেমিনেটিং A3 সাইজ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-hidden"
                >
                  <option value="photocopy">ফটোকপি ও লেমিনেশন</option>
                  <option value="online">অনলাইন আবেদন ও সেবা</option>
                  <option value="photo">ছবি ও প্রিন্ট</option>
                  <option value="compose">কম্পিউটার কম্পোজ</option>
                  <option value="stationery">স্টেশনারি</option>
                  <option value="others">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">দর / রেট (টাকা) *</label>
                <input
                  type="number"
                  min="0.5"
                  step="any"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold text-slate-900 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">একক (Unit)</label>
                <input
                  type="text"
                  placeholder="যেমন: পাতা / সেট / কপি"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-600 bg-white hover:bg-slate-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        )}

        {/* Rate Table */}
        <div className="overflow-y-auto p-5">
          <table className="w-full border-collapse border border-slate-900 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-950 border-b border-slate-900 font-bold">
                <th className="border-r border-slate-900 p-2.5 text-center w-12">নং</th>
                <th className="border-r border-slate-900 p-2.5 text-left">সেবা / পণ্যের বিবরণ</th>
                <th className="border-r border-slate-900 p-2.5 text-center w-24">একক</th>
                <th className="border-r border-slate-900 p-2.5 text-right w-28">মূল্য / দর</th>
                <th className="no-print p-2.5 text-center w-28">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRates.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border-r border-slate-900 p-2 text-center font-mono text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="border-r border-slate-900 p-2">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    {item.description && (
                      <span className="text-[11px] text-slate-500 block">{item.description}</span>
                    )}
                  </td>
                  <td className="border-r border-slate-900 p-2 text-center text-slate-700">
                    {item.unit}
                  </td>
                  <td className="border-r border-slate-900 p-2 text-right font-black text-slate-950 text-sm">
                    {formatCurrency(item.price, shopProfile.useBengaliDigits)}
                  </td>
                  <td className="no-print p-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {onSelectServiceToSale && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectServiceToSale(item);
                            onClose();
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-semibold text-[11px] flex items-center gap-0.5"
                          title="এই সেবা দিয়ে বিক্রি এন্ট্রি করুন"
                        >
                          <span>এন্ট্রি</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`আপনি কি "${item.name}" সেবাটি তালিকা থেকে মুছতে চান?`)) {
                            onDeleteRateItem(item.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Wall Poster Footer (Printed only) */}
          <div className="print-only text-center text-xs text-slate-700 mt-6 pt-3 border-t border-slate-300">
            * নির্ভরযোগ্য ও দ্রুত ডিজিটাল সেবার বিশ্বস্ত ঠিকানা। সততাই ব্যবসার মূলধন।
          </div>
        </div>
      </div>
    </div>
  );
};
