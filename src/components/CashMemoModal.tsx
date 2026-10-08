import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { SaleItem, SaleRecord, ShopProfile } from '../types';
import {
  formatCurrency,
  formatDisplayDate,
  getCurrentTimeString,
  getTodayDateString,
  numberToBengaliWords,
} from '../utils/helpers';

interface CashMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSale?: SaleRecord | null;
  shopProfile: ShopProfile;
  onSaveToSales?: (sale: SaleRecord) => void;
}

export const CashMemoModal: React.FC<CashMemoModalProps> = ({
  isOpen,
  onClose,
  initialSale,
  shopProfile,
  onSaveToSales,
}) => {
  // Memo Fields
  const [memoNo, setMemoNo] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Editable Header Details
  const [shopName, setShopName] = useState(shopProfile.name);
  const [propName, setPropName] = useState(shopProfile.propName);
  const [shopAddress, setShopAddress] = useState(shopProfile.address);
  const [shopPhone, setShopPhone] = useState(shopProfile.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(shopProfile.whatsappNumber || '');
  const [memoFooter, setMemoFooter] = useState(shopProfile.memoFooter);

  // Line Items
  const [items, setItems] = useState<SaleItem[]>([
    { id: '1', name: '', quantity: 1, unit: 'কেজি', unitPrice: 0, total: 0 },
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [previousDue, setPreviousDue] = useState<number>(0);

  // Synchronize with initialSale or initialize new
  useEffect(() => {
    if (initialSale) {
      setMemoNo(initialSale.memoNo);
      setDate(initialSale.date);
      setCustomerName(initialSale.customerName);
      setCustomerPhone(initialSale.customerPhone);
      setCustomerAddress(initialSale.customerAddress || '');
      setItems(
        initialSale.items.length > 0
          ? initialSale.items
          : [{ id: '1', name: '', quantity: 1, unit: 'কেজি', unitPrice: 0, total: 0 }]
      );
      setDiscount(initialSale.discount);
      setPaidAmount(initialSale.paidAmount);
      setPreviousDue(0);
    } else {
      setMemoNo(`MEMO-${Math.floor(1000 + Math.random() * 9000)}`);
      setDate(getTodayDateString());
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setItems([
        { id: '1', name: '', quantity: 1, unit: 'পিস', unitPrice: 0, total: 0 },
        { id: '2', name: '', quantity: 1, unit: 'কেজি', unitPrice: 0, total: 0 },
      ]);
      setDiscount(0);
      setPaidAmount('');
      setPreviousDue(0);
    }
    setShopName(shopProfile.name);
    setPropName(shopProfile.propName);
    setShopAddress(shopProfile.address);
    setShopPhone(shopProfile.phone);
    setWhatsappNumber(shopProfile.whatsappNumber || '');
    setMemoFooter(shopProfile.memoFooter);
  }, [initialSale, isOpen, shopProfile]);

  if (!isOpen) return null;

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
        unit: 'পিস',
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalWithPrev = subtotal + Number(previousDue || 0);
  const grandTotal = Math.max(0, totalWithPrev - Number(discount || 0));
  const currentPaid = paidAmount === '' ? grandTotal : Number(paidAmount);
  const dueAmount = Math.max(0, grandTotal - currentPaid);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToSalesList = () => {
    if (!onSaveToSales) return;
    const validItems = items.filter((i) => i.name.trim() !== '');
    if (validItems.length === 0) {
      alert('অনুগ্রহ করে পণ্যের বিবরণ লিখুন!');
      return;
    }

    const saleRecord: SaleRecord = {
      id: initialSale ? initialSale.id : `sale-${Date.now()}`,
      memoNo: memoNo || `MEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      date,
      time: getCurrentTimeString(),
      customerName: customerName.trim() || 'খুচরা ক্রেতা',
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: validItems,
      subtotal,
      discount: Number(discount) || 0,
      grandTotal,
      paidAmount: currentPaid,
      dueAmount,
      paymentMethod:
        dueAmount > 0 && currentPaid > 0
          ? 'mixed'
          : dueAmount > 0
          ? 'due'
          : 'cash',
      notes: 'ডিজিটাল ক্যাশ মেমো থেকে সংগৃহীত',
    };

    onSaveToSales(saleRecord);
    alert('মেমোর তথ্য বিক্রয় তালিকায় সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:m-0 print:bg-white print:static">
      {/* Modal Container */}
      <div className="modal-container bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto border border-slate-200 print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">
              ডিজিタル ক্যাশ মেমো (Digital Cash Memo)
            </h3>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700 hidden sm:inline-block">
              A4 ফুল পেজ সাইজ
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSaveToSales && !initialSale && (
              <button
                onClick={handleSaveToSalesList}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                title="এই মেমো বিক্রয় তালিকায় সংরক্ষণ করুন"
              >
                <Save className="w-3.5 h-3.5" />
                <span>বিক্রয় তালিকায় যোগ</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>মেমো প্রিন্ট করুন</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Memo Body */}
        <div className="modal-scroll-area overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          {/* Authentic Cash Memo Sheet / Layout */}
          <div
            id="printable-cash-memo"
            className="a4-memo-sheet bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-slate-900 w-full max-w-2xl font-sans print:rounded-none print:shadow-none print:max-w-full"
          >
            {/* Header: Shop Profile */}
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full text-center text-xl sm:text-2xl font-black text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-hidden tracking-tight"
                placeholder="দোকানের নাম"
              />
              <div className="text-xs text-slate-700 font-semibold mt-0.5 flex items-center justify-center gap-1">
                <span>প্রোপ্রাইটর:</span>
                <input
                  type="text"
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  className="text-xs font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-hidden text-center"
                  placeholder="স্বত্বাধিকারী"
                />
              </div>
              <input
                type="text"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full text-center text-xs text-slate-600 border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-hidden mt-0.5"
                placeholder="দোকানের ঠিকানা"
              />
              <div className="flex flex-wrap items-center justify-center gap-x-2 text-xs text-slate-700 mt-1">
                <span>মোবাইল:</span>
                <input
                  type="text"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="text-xs text-slate-800 font-medium border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-hidden text-center"
                />
                {whatsappNumber && (
                  <>
                    <span className="text-slate-400">|</span>
                    <span>হোয়াটসঅ্যাপ:</span>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="text-xs text-emerald-800 font-medium border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-hidden text-center"
                    />
                  </>
                )}
              </div>
              <div className="inline-block mt-2 px-4 py-0.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded">
                ক্যাশ মেমো / CASH MEMO
              </div>
            </div>

            {/* Memo No, Date & Customer Details */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4 pb-3 border-b border-slate-200">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-800 whitespace-nowrap">মেমো নং:</span>
                  <input
                    type="text"
                    value={memoNo}
                    onChange={(e) => setMemoNo(e.target.value)}
                    className="w-full font-mono font-semibold text-slate-800 border-b border-dotted border-slate-400 focus:border-slate-900 focus:outline-hidden px-1"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-800 whitespace-nowrap">ক্রেতার নাম:</span>
                  <input
                    type="text"
                    placeholder="নাম লিখুন..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border-b border-dotted border-slate-400 focus:border-slate-900 focus:outline-hidden px-1 font-medium"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-800 whitespace-nowrap">ঠিকানা:</span>
                  <input
                    type="text"
                    placeholder="ঠিকানা..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full border-b border-dotted border-slate-400 focus:border-slate-900 focus:outline-hidden px-1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-800 whitespace-nowrap">তারিখ:</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border-b border-dotted border-slate-400 focus:border-slate-900 focus:outline-hidden px-1"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-800 whitespace-nowrap">মোবাইল:</span>
                  <input
                    type="text"
                    placeholder="০১xxxxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border-b border-dotted border-slate-400 focus:border-slate-900 focus:outline-hidden px-1 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-4">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
                    <th className="border-r border-slate-900 p-1.5 text-center w-10">ক্রমিক</th>
                    <th className="border-r border-slate-900 p-1.5 text-left">পণ্যের বিবরণ (Description)</th>
                    <th className="border-r border-slate-900 p-1.5 text-center w-16">পরিমাণ</th>
                    <th className="border-r border-slate-900 p-1.5 text-center w-16">একক</th>
                    <th className="border-r border-slate-900 p-1.5 text-right w-20">দর (৳)</th>
                    <th className="p-1.5 text-right w-24">মোট টাকা (৳)</th>
                    <th className="no-print p-1.5 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="border-r border-slate-900 p-1 text-center font-mono text-slate-600">
                        {index + 1}
                      </td>
                      <td className="border-r border-slate-900 p-1">
                        <input
                          type="text"
                          placeholder="পণ্যের নাম..."
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full bg-transparent border-0 p-0 text-xs focus:ring-0 font-medium"
                        />
                      </td>
                      <td className="border-r border-slate-900 p-1 text-center">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full bg-transparent border-0 p-0 text-xs text-center focus:ring-0"
                        />
                      </td>
                      <td className="border-r border-slate-900 p-1 text-center">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-full bg-transparent border-0 p-0 text-xs text-center focus:ring-0"
                        />
                      </td>
                      <td className="border-r border-slate-900 p-1 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice || ''}
                          placeholder="0"
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          className="w-full bg-transparent border-0 p-0 text-xs text-right focus:ring-0"
                        />
                      </td>
                      <td className="p-1 text-right font-bold text-slate-900">
                        {formatCurrency(item.total, shopProfile.useBengaliDigits)}
                      </td>
                      <td className="no-print p-1 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="text-slate-300 hover:text-rose-600 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Empty rows to gracefully fill out the A4 full page table */}
                  {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="border-b border-slate-300 h-7 print:table-row">
                      <td className="border-r border-slate-900 p-1 text-center font-mono text-slate-400 text-[11px]">
                        {items.length + idx + 1}
                      </td>
                      <td className="border-r border-slate-900 p-1"></td>
                      <td className="border-r border-slate-900 p-1"></td>
                      <td className="border-r border-slate-900 p-1"></td>
                      <td className="border-r border-slate-900 p-1"></td>
                      <td className="p-1"></td>
                      <td className="no-print p-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add row button (hidden on print) */}
              <div className="no-print mt-2 flex justify-start">
                <button
                  type="button"
                  onClick={addItemRow}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> নতুন সারি যোগ করুন
                </button>
              </div>
            </div>

            {/* Calculations & In Words Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
              {/* Left Side: In Words & Notes */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-slate-700 mb-1">কথায় (In Words):</div>
                  <div className="p-2 border border-slate-300 rounded bg-slate-50/50 font-medium text-slate-800 italic">
                    {numberToBengaliWords(grandTotal)}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2">
                  <div className="font-bold text-slate-700 mb-0.5">শর্তাবলী / বিশেষ দ্রষ্টব্য:</div>
                  <input
                    type="text"
                    value={memoFooter}
                    onChange={(e) => setMemoFooter(e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-hidden text-[11px] text-slate-600"
                  />
                </div>
              </div>

              {/* Right Side: Totals */}
              <div className="border border-slate-900 rounded p-2.5 space-y-1.5 text-xs bg-slate-50/30">
                <div className="flex justify-between items-center text-slate-700">
                  <span>মোট টাকা (Subtotal):</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(subtotal, shopProfile.useBengaliDigits)}
                  </span>
                </div>

                {previousDue > 0 && (
                  <div className="flex justify-between items-center text-slate-700">
                    <span>পূর্বের বকেয়া (Previous Due):</span>
                    <input
                      type="number"
                      value={previousDue}
                      onChange={(e) => setPreviousDue(Number(e.target.value))}
                      className="w-20 px-1 py-0.5 border border-slate-300 rounded text-right bg-white text-xs"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-700">
                  <span>কমিশন / ছাড় (Discount):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ''}
                    placeholder="0"
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-20 px-1 py-0.5 border border-slate-300 rounded text-right bg-white text-xs font-semibold"
                  />
                </div>

                <div className="flex justify-between items-center font-bold text-sm text-slate-950 border-t border-slate-900 pt-1">
                  <span>সর্বমোট বিল (Grand Total):</span>
                  <span className="text-emerald-800">
                    {formatCurrency(grandTotal, shopProfile.useBengaliDigits)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-800 font-medium pt-1">
                  <span>জমা / পরিশোধ (Paid):</span>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    placeholder={String(grandTotal)}
                    onChange={(e) =>
                      setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-20 px-1 py-0.5 border border-slate-300 rounded text-right bg-white text-xs font-bold text-emerald-700"
                  />
                </div>

                <div className="flex justify-between items-center font-bold text-rose-700 border-t border-dotted border-slate-300 pt-1">
                  <span>অবশিষ্ট বকেয়া (Due):</span>
                  <span>{formatCurrency(dueAmount, shopProfile.useBengaliDigits)}</span>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="mt-auto pt-10 print:pt-16 flex justify-between items-end text-xs text-slate-800">
              <div className="text-center w-36">
                <div className="border-t border-slate-900 pt-1">ক্রেতার স্বাক্ষর</div>
              </div>

              <div className="text-center w-40">
                <div className="border-t border-slate-900 pt-1 font-bold">
                  বিক্রেতার স্বাক্ষর ও সিল
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
