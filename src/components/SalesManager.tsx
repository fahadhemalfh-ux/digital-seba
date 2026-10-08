import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  Search,
  Download,
  Phone,
  User,
  ShoppingBag,
  DollarSign,
  ChevronDown,
  X,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { PaymentMethod, SaleItem, SaleRecord, ShopProfile } from '../types';
import {
  exportToCSV,
  formatCurrency,
  formatDisplayDate,
  getCurrentTimeString,
  getTodayDateString,
} from '../utils/helpers';

interface SalesManagerProps {
  sales: SaleRecord[];
  onAddSale: (sale: SaleRecord) => void;
  onDeleteSale: (id: string) => void;
  shopProfile: ShopProfile;
  onOpenDigitalMemo: (sale?: SaleRecord) => void;
  autoOpenForm?: boolean;
  prefillCustomer?: { name: string; phone: string; address?: string } | null;
  prefillService?: { name: string; unit: string; price: number } | null;
}

export const SalesManager: React.FC<SalesManagerProps> = ({
  sales,
  onAddSale,
  onDeleteSale,
  shopProfile,
  onOpenDigitalMemo,
  autoOpenForm,
  prefillCustomer,
  prefillService,
}) => {
  const [showForm, setShowForm] = useState(autoOpenForm || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Form State
  const [customerName, setCustomerName] = useState(prefillCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(prefillCustomer?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(prefillCustomer?.address || '');
  const [saleDate, setSaleDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Items State (multiple items allowed)
  const [items, setItems] = useState<SaleItem[]>([
    prefillService
      ? {
          id: '1',
          name: prefillService.name,
          quantity: 1,
          unit: prefillService.unit,
          unitPrice: prefillService.price,
          total: prefillService.price,
        }
      : { id: '1', name: '', quantity: 1, unit: 'পাতা', unitPrice: 0, total: 0 },
  ]);

  // Effect to handle incoming prefill triggers
  React.useEffect(() => {
    if (autoOpenForm) setShowForm(true);
    if (prefillCustomer) {
      setCustomerName(prefillCustomer.name);
      setCustomerPhone(prefillCustomer.phone);
      if (prefillCustomer.address) setCustomerAddress(prefillCustomer.address);
      setShowForm(true);
    }
  }, [autoOpenForm, prefillCustomer]);

  React.useEffect(() => {
    if (prefillService) {
      setItems([
        {
          id: Date.now().toString(),
          name: prefillService.name,
          quantity: 1,
          unit: prefillService.unit,
          unitPrice: prefillService.price,
          total: prefillService.price,
        },
      ]);
      setShowForm(true);
    }
  }, [prefillService]);

  const unitsList = ['পিস', 'পাতা', 'কপি', 'সেট', 'বক্স', 'প্যাকেট', 'রিম', 'ডজন', 'বই', 'কেজি', 'মিটার'];

  const quickServices = [
    { name: 'ফটোকপি (A4)', unit: 'পাতা', price: 2.5 },
    { name: 'অনলাইন চাকরির আবেদন', unit: 'সেবা', price: 150 },
    { name: 'পাসপোর্ট সাইজ ছবি প্রিন্ট', unit: 'সেট', price: 80 },
    { name: 'কম্পিউটার কম্পোজ ও প্রিন্ট', unit: 'পাতা', price: 40 },
    { name: 'সার্টিফিকেট লেমিনেটিং', unit: 'পিস', price: 30 },
    { name: 'জন্ম নিবন্ধন অনলাইন আবেদন', unit: 'সেবা', price: 200 },
    { name: 'বসুন্ধরা খাতা', unit: 'পিস', price: 55 },
    { name: 'ম্যাটাডোর বলপেন', unit: 'পিস', price: 6 },
  ];

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : item.quantity;
      const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.total = (isNaN(q) ? 0 : q) * (isNaN(p) ? 0 : p);
    }

    updated[index] = item;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: '',
        quantity: 1,
        unit: 'কেজি',
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const grandTotal = Math.max(0, subtotal - Number(discount || 0));
  const effectivePaid = paidAmount === '' ? grandTotal : Number(paidAmount);
  const dueAmount = Math.max(0, grandTotal - effectivePaid);

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter((item) => item.name.trim() !== '');
    if (validItems.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি পণ্যের নাম লিখুন!');
      return;
    }

    const memoNumber = `MEMO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSale: SaleRecord = {
      id: `sale-${Date.now()}`,
      memoNo: memoNumber,
      date: saleDate || getTodayDateString(),
      time: getCurrentTimeString(),
      customerName: customerName.trim() || 'খুচরা গ্রাহক',
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: validItems,
      subtotal,
      discount: Number(discount) || 0,
      grandTotal,
      paidAmount: effectivePaid,
      dueAmount,
      paymentMethod:
        dueAmount > 0 && effectivePaid > 0
          ? 'mixed'
          : dueAmount > 0
          ? 'due'
          : paymentMethod,
      notes: notes.trim(),
    };

    onAddSale(newSale);

    // Reset Form
    setShowForm(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setItems([{ id: '1', name: '', quantity: 1, unit: 'কেজি', unitPrice: 0, total: 0 }]);
    setDiscount(0);
    setPaidAmount('');
    setNotes('');
  };

  // Filter Sales
  const filteredSales = sales.filter((s) => {
    const matchSearch =
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerPhone.includes(searchQuery) ||
      s.memoNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchPayment =
      paymentFilter === 'all'
        ? true
        : paymentFilter === 'due'
        ? s.dueAmount > 0
        : s.paymentMethod === paymentFilter;

    const matchDate = selectedDate ? s.date === selectedDate : true;

    return matchSearch && matchPayment && matchDate;
  });

  const handleExportCSV = () => {
    const csvData = sales.map((s) => ({
      'মেমো নং': s.memoNo,
      'তারিখ': s.date,
      'সময়': s.time,
      'ক্রেতার নাম': s.customerName,
      'মোবাইল': s.customerPhone,
      'মোট পণ্য সংখ্যা': s.items.length,
      'পণ্যের তালিকা': s.items.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join('; '),
      'সাবটোটাল (টাকা)': s.subtotal,
      'ডিসকাউন্ট (টাকা)': s.discount,
      'সর্বমোট বিল (টাকা)': s.grandTotal,
      'পরিশোধ (টাকা)': s.paidAmount,
      'বাকি (টাকা)': s.dueAmount,
      'পেমেন্ট মাধ্যম': s.paymentMethod,
      'মন্তব্য': s.notes || '',
    }));

    exportToCSV(csvData, `DokanKhata_Sales_${getTodayDateString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <span>দৈনিক বিক্রয় ব্যবস্থাপনা (Sales Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            পণ্য বিক্রি করুন, নগদ বা বাকির হিসাব রাখুন এবং তাৎক্ষণিক মেমো তৈরি করুন।
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'ফর্ম বন্ধ করুন' : 'নতুন বিক্রি এন্ট্রি'}</span>
          </button>
        </div>
      </div>

      {/* Sale Entry Collapsible Modal/Form */}
      {showForm && (
        <form
          onSubmit={handleSaveSale}
          className="bg-white rounded-xl border-2 border-emerald-500/30 p-5 shadow-md space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              নতুন বিক্রয়ের বিবরণ ও গ্রাহক তথ্য
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Customer & Date Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                গ্রাহকের নাম (Customer Name)
              </label>
              <input
                type="text"
                placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                মোবাইল নম্বর (Phone)
              </label>
              <input
                type="text"
                placeholder="017xxxxxxxx"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                তারিখ (Date)
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                পেমেন্ট মাধ্যম (Payment)
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value="cash">নগদ (Cash)</option>
                <option value="bkash">বিকাশ (bKash)</option>
                <option value="nagad">নগদ ওয়ালেট (Nagad)</option>
                <option value="due">সম্পূর্ণ বাকি (Due)</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-bold text-slate-700">
                পণ্যের তালিকা (Product / Services)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 hidden sm:inline">দ্রুত সেবা যোগ:</span>
                <div className="flex flex-wrap gap-1">
                  {quickServices.slice(0, 5).map((qs) => (
                    <button
                      key={qs.name}
                      type="button"
                      onClick={() => {
                        // If first item is empty, replace it; else append
                        if (items.length === 1 && !items[0].name.trim() && !items[0].unitPrice) {
                          setItems([
                            {
                              id: '1',
                              name: qs.name,
                              quantity: 1,
                              unit: qs.unit,
                              unitPrice: qs.price,
                              total: qs.price,
                            },
                          ]);
                        } else {
                          setItems([
                            ...items,
                            {
                              id: Date.now().toString(),
                              name: qs.name,
                              quantity: 1,
                              unit: qs.unit,
                              unitPrice: qs.price,
                              total: qs.price,
                            },
                          ]);
                        }
                      }}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded text-[10px] font-medium border border-slate-200 transition-colors"
                    >
                      + {qs.name.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-medium">পণ্যের বিবরণ</th>
                    <th className="p-2.5 font-medium w-24">পরিমাণ</th>
                    <th className="p-2.5 font-medium w-28">একক (Unit)</th>
                    <th className="p-2.5 font-medium w-28">দর / মূল্য (৳)</th>
                    <th className="p-2.5 font-medium w-28 text-right">মোট (৳)</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="পণ্যের নাম (যেমন: মিনিকেট চাল, তেল...)"
                          value={item.name}
                          onChange={(e) => updateItem(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                          required={idx === 0}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        >
                          {unitsList.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0.00"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold text-slate-800">
                        {formatCurrency(item.total, shopProfile.useBengaliDigits)}
                      </td>
                      <td className="p-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Prominent + Add Item Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={addItemRow}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs group"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>+ নতুন পণ্য / সার্ভিস লাইন যোগ করুন (Add Product / Service)</span>
              </button>
            </div>
          </div>

          {/* Totals & Payment Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between gap-6 text-xs">
            <div className="flex-1 space-y-2">
              <label className="block text-slate-600 font-medium">
                অতিরিক্ত মন্তব্য / নোট (ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                placeholder="যেমন: ডেলিভারি ঠিকানা বা বকেয়া পরিশোধের প্রতিশ্রুতি তারিখ..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="w-full md:w-80 space-y-2 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 pt-3 md:pt-0">
              <div className="flex justify-between text-slate-600">
                <span>মোট বিল (Subtotal):</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(subtotal, shopProfile.useBengaliDigits)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>বিশেষ ছাড় / ডিসকাউন্ট (৳):</span>
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-24 px-2 py-1 border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                <span>সর্বমোট প্রদেয় বিল:</span>
                <span className="text-emerald-700">
                  {formatCurrency(grandTotal, shopProfile.useBengaliDigits)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-medium text-slate-700">জমা / নগদ প্রদান:</span>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={String(grandTotal)}
                  className="w-24 px-2 py-1 border border-slate-200 rounded text-right text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                />
              </div>

              {dueAmount > 0 && (
                <div className="flex justify-between text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                  <span>বাকি থাকবে (Due):</span>
                  <span>{formatCurrency(dueAmount, shopProfile.useBengaliDigits)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>বিক্রি সংরক্ষণ করুন</span>
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
            placeholder="মেমো নং, কাস্টমার বা পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">সব পেমেন্ট ধরন</option>
            <option value="cash">নগদ (Cash)</option>
            <option value="bkash">বিকাশ (bKash)</option>
            <option value="nagad">নগদ ওয়ালেট</option>
            <option value="due">বাকি (Due Only)</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
            title="নির্দিষ্ট তারিখের বিক্রয় তালিকা"
          />

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-rose-600 hover:text-rose-800 text-[11px] font-medium"
            >
              তারিখ মুছুন
            </button>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-semibold">মেমো নং ও তারিখ</th>
                <th className="p-3.5 font-semibold">গ্রাহকের বিবরণ</th>
                <th className="p-3.5 font-semibold">পণ্যের তালিকা</th>
                <th className="p-3.5 font-semibold text-right">মোট বিল</th>
                <th className="p-3.5 font-semibold text-right">পরিশোধ</th>
                <th className="p-3.5 font-semibold text-right">বাকি</th>
                <th className="p-3.5 font-semibold text-center">মাধ্যম</th>
                <th className="p-3.5 font-semibold text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <span className="font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {sale.memoNo}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {formatDisplayDate(sale.date, shopProfile.useBengaliDigits)} • {sale.time}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-medium text-slate-900">{sale.customerName}</div>
                    {sale.customerPhone && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                        {sale.customerPhone}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5 max-w-xs">
                    <div className="text-slate-700 line-clamp-2">
                      {sale.items.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                    </div>
                    {sale.notes && (
                      <div className="text-[10px] text-slate-400 italic mt-0.5">
                        নোট: {sale.notes}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5 text-right font-bold text-slate-900">
                    {formatCurrency(sale.grandTotal, shopProfile.useBengaliDigits)}
                  </td>

                  <td className="p-3.5 text-right text-emerald-600 font-medium">
                    {formatCurrency(sale.paidAmount, shopProfile.useBengaliDigits)}
                  </td>

                  <td className="p-3.5 text-right">
                    {sale.dueAmount > 0 ? (
                      <span className="font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        {formatCurrency(sale.dueAmount, shopProfile.useBengaliDigits)}
                      </span>
                    ) : (
                      <span className="text-slate-400">০</span>
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        sale.paymentMethod === 'cash'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sale.paymentMethod === 'bkash'
                          ? 'bg-pink-100 text-pink-800'
                          : sale.paymentMethod === 'due'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {sale.paymentMethod === 'cash'
                        ? 'নগদ'
                        : sale.paymentMethod === 'bkash'
                        ? 'বিকাশ'
                        : sale.paymentMethod === 'due'
                        ? 'বাকি'
                        : sale.paymentMethod}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenDigitalMemo(sale)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded border border-slate-200 transition-colors"
                        title="ক্যাশ মেমো প্রিন্ট করুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${sale.memoNo}" বিক্রির রেকর্ডটি মুছে ফেলতে চান?`)) {
                            onDeleteSale(sale.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    কোনো বিক্রির তথ্য খুঁজে পাওয়া যায়নি।
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
