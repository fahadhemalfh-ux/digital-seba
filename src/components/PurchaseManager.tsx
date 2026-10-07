import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  X,
  Truck,
  Hash,
} from 'lucide-react';
import { PurchaseRecord, ShopProfile } from '../types';
import {
  exportToCSV,
  formatCurrency,
  formatDisplayDate,
  getTodayDateString,
} from '../utils/helpers';

interface PurchaseManagerProps {
  purchases: PurchaseRecord[];
  onAddPurchase: (purchase: PurchaseRecord) => void;
  onDeletePurchase: (id: string) => void;
  shopProfile: ShopProfile;
}

export const PurchaseManager: React.FC<PurchaseManagerProps> = ({
  purchases,
  onAddPurchase,
  onDeletePurchase,
  shopProfile,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');

  // Form State
  const [itemName, setItemName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState('পিস');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'due' | 'bank' | 'bkash' | 'nagad'>('cash');
  const [challanNo, setChallanNo] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !totalCost) {
      alert('অনুগ্রহ করে পণ্যের বিবরণ ও মোট ক্রয় খরচ লিখুন!');
      return;
    }

    const newPurchase: PurchaseRecord = {
      id: `pur-${Date.now()}`,
      date: date || getTodayDateString(),
      supplierName: supplierName.trim() || 'সাধারণ মহাজন/ডিলার',
      supplierPhone: supplierPhone.trim(),
      itemName: itemName.trim(),
      quantity: quantity === '' ? undefined : Number(quantity),
      unit: quantity ? unit : undefined,
      totalCost: Number(totalCost),
      paymentMethod,
      challanNo: challanNo.trim(),
      notes: notes.trim(),
    };

    onAddPurchase(newPurchase);

    // Reset
    setShowForm(false);
    setItemName('');
    setSupplierName('');
    setSupplierPhone('');
    setQuantity('');
    setTotalCost('');
    setChallanNo('');
    setNotes('');
  };

  const filteredPurchases = purchases.filter((p) => {
    const matchSearch =
      p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.challanNo && p.challanNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchPayment = filterPayment === 'all' || p.paymentMethod === filterPayment;

    return matchSearch && matchPayment;
  });

  const totalSpent = filteredPurchases.reduce((acc, curr) => acc + curr.totalCost, 0);

  const handleExportCSV = () => {
    const csvData = purchases.map((p) => ({
      'আইডি': p.id,
      'তারিখ': p.date,
      'পণ্যের বিবরণ': p.itemName,
      'মহাজন/সাপ্লায়ার': p.supplierName,
      'মোবাইল': p.supplierPhone || '',
      'পরিমাণ': p.quantity ? `${p.quantity} ${p.unit || ''}` : '',
      'মোট খরচ (টাকা)': p.totalCost,
      'পেমেন্ট মাধ্যম': p.paymentMethod,
      'চালান নম্বর': p.challanNo || '',
      'নোট': p.notes || '',
    }));

    exportToCSV(csvData, `DokanKhata_Purchases_${getTodayDateString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <span>দৈনিক পণ্য ক্রয় ও স্টক হিসাব (Purchases & Stock-in)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            মহাজন ও পাইকারি মোকাম হতে মাল ক্রয়ের চালান ও পেমেন্ট সংরক্ষণ করুন।
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন পণ্য ক্রয় এন্ট্রি'}</span>
          </button>
        </div>
      </div>

      {/* Purchase Entry Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border-2 border-indigo-500/30 p-5 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              নতুন পণ্য ক্রয় ও চালান তথ্য
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">
                পণ্যের নাম / মালের বিবরণ *
              </label>
              <input
                type="text"
                placeholder="যেমন: মিনিকেট চাল ৫০ কেজি বস্তা (১০ বস্তা) বা সয়াবিন তেল কার্টুন"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                মোট ক্রয় মূল্য (৳) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="0.00"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                মহাজন / সাপ্লায়ার / ডিলারের নাম
              </label>
              <input
                type="text"
                placeholder="যেমন: সিটি গ্রুপ বা কুষ্টিয়া রাইস এজেন্সি"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                মহাজনের মোবাইল
              </label>
              <input
                type="text"
                placeholder="017xxxxxxxx"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                চালান / ভাউচার নম্বর (যদি থাকে)
              </label>
              <input
                type="text"
                placeholder="CH-1234"
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-slate-600 font-medium mb-1">পরিমাণ</label>
                <input
                  type="number"
                  placeholder="যেমন: 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="w-24">
                <label className="block text-slate-600 font-medium mb-1">একক</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                >
                  <option value="বস্তা">বস্তা</option>
                  <option value="কার্টুন">কার্টুন</option>
                  <option value="পিস">পিস</option>
                  <option value="কেজি">কেজি</option>
                  <option value="লিটার">লিটার</option>
                  <option value="ড্রাম">ড্রাম</option>
                </select>
              </div>
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
                <option value="cash">নগদ প্রদান (Cash)</option>
                <option value="due">বাকিতে ক্রয় (Due)</option>
                <option value="bank">ব্যাংক / চেক (Bank)</option>
                <option value="bkash">বিকাশ (bKash)</option>
                <option value="nagad">নগদ ওয়ালেট (Nagad)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">তারিখ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-slate-600 font-medium mb-1">নোট / মন্তব্য</label>
            <input
              type="text"
              placeholder="যেমন: অর্ধেক নগদ পরিশোধ, বাকি অর্ধেক আগামী চালানে শোধ হবে..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ক্রয় রেকর্ড সংরক্ষণ করুন</span>
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
            placeholder="পণ্য, মহাজন বা চালান নং দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">সকল পেমেন্ট ধরন</option>
            <option value="cash">নগদ</option>
            <option value="due">বাকি</option>
            <option value="bank">ব্যাংক</option>
            <option value="bkash">বিকাশ</option>
          </select>

          <div className="text-slate-500 font-medium">
            মোট ক্রয়: <span className="font-bold text-slate-900">{formatCurrency(totalSpent, shopProfile.useBengaliDigits)}</span>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">তারিখ ও চালান</th>
                <th className="p-3.5 font-semibold">পণ্যের বিবরণ</th>
                <th className="p-3.5 font-semibold">মহাজন / সরবরাহকারী</th>
                <th className="p-3.5 font-semibold">পরিমাণ</th>
                <th className="p-3.5 font-semibold text-right">মোট ক্রয় খরচ</th>
                <th className="p-3.5 font-semibold text-center">পেমেন্ট</th>
                <th className="p-3.5 font-semibold text-center">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <div className="font-medium text-slate-800">
                      {formatDisplayDate(purchase.date, shopProfile.useBengaliDigits)}
                    </div>
                    {purchase.challanNo && (
                      <span className="inline-block mt-0.5 font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                        #{purchase.challanNo}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 font-semibold text-slate-900">
                    {purchase.itemName}
                    {purchase.notes && (
                      <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                        {purchase.notes}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5">
                    <div className="text-slate-800 font-medium">{purchase.supplierName}</div>
                    {purchase.supplierPhone && (
                      <div className="text-[11px] text-slate-400">{purchase.supplierPhone}</div>
                    )}
                  </td>

                  <td className="p-3.5 text-slate-600">
                    {purchase.quantity ? `${purchase.quantity} ${purchase.unit || ''}` : '-'}
                  </td>

                  <td className="p-3.5 text-right font-bold text-indigo-700">
                    {formatCurrency(purchase.totalCost, shopProfile.useBengaliDigits)}
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        purchase.paymentMethod === 'cash'
                          ? 'bg-emerald-100 text-emerald-800'
                          : purchase.paymentMethod === 'due'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {purchase.paymentMethod === 'cash'
                        ? 'নগদ'
                        : purchase.paymentMethod === 'due'
                        ? 'বাকি'
                        : purchase.paymentMethod === 'bank'
                        ? 'ব্যাংক'
                        : purchase.paymentMethod}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`আপনি কি "${purchase.itemName}" ক্রয়ের রেকর্ডটি মুছতে চান?`)) {
                          onDeletePurchase(purchase.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    কোনো ক্রয়ের রেকর্ড পাওয়া যায়নি।
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
