import React, { useState } from 'react';
import {
  BookOpen,
  Phone,
  Search,
  MessageSquare,
  DollarSign,
  CheckCircle,
  Copy,
  ExternalLink,
  User,
  ArrowRight,
} from 'lucide-react';
import { SaleRecord, ShopProfile } from '../types';
import { formatCurrency, formatDisplayDate } from '../utils/helpers';

interface DueBookProps {
  sales: SaleRecord[];
  onUpdateSale: (updatedSale: SaleRecord) => void;
  shopProfile: ShopProfile;
}

export const DueBook: React.FC<DueBookProps> = ({ sales, onUpdateSale, shopProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Group sales with dueAmount > 0 by Customer (name or phone)
  interface CustomerDueGroup {
    name: string;
    phone: string;
    address?: string;
    totalDue: number;
    salesWithDue: SaleRecord[];
    lastDate: string;
  }

  const customerMap = sales.reduce((acc, sale) => {
    if (sale.dueAmount <= 0) return acc;
    const key = (sale.customerPhone || sale.customerName).trim().toLowerCase();
    if (!acc[key]) {
      acc[key] = {
        name: sale.customerName,
        phone: sale.customerPhone,
        address: sale.customerAddress,
        totalDue: 0,
        salesWithDue: [],
        lastDate: sale.date,
      };
    }
    acc[key].totalDue += sale.dueAmount;
    acc[key].salesWithDue.push(sale);
    if (sale.date > acc[key].lastDate) {
      acc[key].lastDate = sale.date;
    }
    return acc;
  }, {} as Record<string, CustomerDueGroup>);

  const customerDueList = Object.values(customerMap).filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  });

  const totalOutstandingDue = Object.values(customerMap).reduce(
    (sum, c) => sum + c.totalDue,
    0
  );

  // Handle paying off due on earliest unpaid sales
  const handleCollectDue = (customer: CustomerDueGroup) => {
    const pay = Number(paymentAmount);
    if (!pay || pay <= 0) {
      alert('অনুগ্রহ করে সঠিক জমার পরিমাণ লিখুন!');
      return;
    }

    let remainingToPay = pay;
    // Sort sales by date ascending to pay oldest first
    const sortedSales = [...customer.salesWithDue].sort((a, b) => a.date.localeCompare(b.date));

    for (const s of sortedSales) {
      if (remainingToPay <= 0) break;
      const deduction = Math.min(s.dueAmount, remainingToPay);
      const updated: SaleRecord = {
        ...s,
        paidAmount: s.paidAmount + deduction,
        dueAmount: s.dueAmount - deduction,
        notes: (s.notes ? s.notes + ' | ' : '') + `বকেয়া জমা: ৳${deduction}`,
      };
      onUpdateSale(updated);
      remainingToPay -= deduction;
    }

    setPaymentAmount('');
    setSelectedCustomer(null);
    alert(`সফলভাবে ৳${pay} বকেয়া টাকা জমা নেওয়া হয়েছে!`);
  };

  // Generate WhatsApp / SMS Reminder
  const getReminderMessage = (customer: CustomerDueGroup) => {
    const contactInfo = `মোবাইল: ${shopProfile.phone}${shopProfile.whatsappNumber ? ` | হোয়াটসঅ্যাপ: ${shopProfile.whatsappNumber}` : ''}`;
    return `আসসালামু আলাইকুম ${customer.name} ভাই,\n${shopProfile.name} (${shopProfile.propName}) থেকে বিনীতভাবে জানানো যাচ্ছে যে, আপনার পূর্বের মোট বকেয়া ${formatCurrency(customer.totalDue, shopProfile.useBengaliDigits)}। অনুগ্রহ করে দ্রুত হিসাব মিলিয়ে পরিশোধ করার জন্য অনুরোধ রইলো।\nযোগাযোগ: ${contactInfo}`;
  };

  const handleCopyReminder = (customer: CustomerDueGroup) => {
    const text = getReminderMessage(customer);
    navigator.clipboard.writeText(text);
    setCopySuccess(customer.phone || customer.name);
    setTimeout(() => setCopySuccess(null), 3000);
  };

  const handleWhatsAppReminder = (customer: CustomerDueGroup) => {
    const text = encodeURIComponent(getReminderMessage(customer));
    const phoneFormatted = customer.phone.replace(/[^0-9]/g, '');
    const fullPhone = phoneFormatted.startsWith('88') ? phoneFormatted : `88${phoneFormatted}`;
    window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Total Due Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>গ্রাহক বাকির খাতা (Customer Due Ledger)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            কার কাছে কত বাকি আছে তার তালিকা, বকেয়া আদায় এবং দ্রুত তাগাদা বার্তা পাঠানো।
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <div>
            <div className="text-[11px] font-semibold text-amber-800 uppercase">
              মোট অনাদায়ী বকেয়া
            </div>
            <div className="text-xl font-bold text-amber-950">
              {formatCurrency(totalOutstandingDue, shopProfile.useBengaliDigits)}
            </div>
          </div>
          <span className="text-xs text-amber-700 bg-amber-100/70 px-2 py-1 rounded-md font-medium">
            {customerDueList.length} জন বাকিদার
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="বাকিদার গ্রাহকের নাম বা মোবাইল নম্বর লিখুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Due Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customerDueList.map((customer) => (
          <div
            key={customer.phone || customer.name}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{customer.name}</h3>
                    {customer.phone && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                  {formatCurrency(customer.totalDue, shopProfile.useBengaliDigits)}
                </span>
              </div>

              {customer.address && (
                <p className="text-[11px] text-slate-500 mb-2 truncate">
                  ঠিকানা: {customer.address}
                </p>
              )}

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>সর্বশেষ বাকি লেনদেন:</span>
                  <span className="font-medium text-slate-700">
                    {formatDisplayDate(customer.lastDate, shopProfile.useBengaliDigits)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>বকেয়া মেমো সংখ্যা:</span>
                  <span className="font-medium text-slate-700">
                    {customer.salesWithDue.length} টি
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Settle / Reminder */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              {selectedCustomer === (customer.phone || customer.name) ? (
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 space-y-2 animate-in fade-in">
                  <div className="text-xs font-semibold text-emerald-900">বকেয়া টাকা জমা নিন:</div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max={customer.totalDue}
                      placeholder={`সর্বোচ্চ ${customer.totalDue}`}
                      value={paymentAmount}
                      onChange={(e) =>
                        setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full px-2 py-1 border border-emerald-300 rounded text-xs bg-white focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleCollectDue(customer)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shrink-0"
                    >
                      জমা
                    </button>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs shrink-0"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer.phone || customer.name);
                      setPaymentAmount(customer.totalDue);
                    }}
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>টাকা জমা নিন</span>
                  </button>

                  <button
                    onClick={() => handleCopyReminder(customer)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition-colors"
                    title="তাগাদা বার্তা কপি করুন"
                  >
                    {copySuccess === (customer.phone || customer.name) ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {customer.phone && (
                    <button
                      onClick={() => handleWhatsAppReminder(customer)}
                      className="p-1.5 text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs transition-colors"
                      title="হোয়াটসঅ্যাপে তাগাদা পাঠান"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {customerDueList.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-xl border border-slate-200 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">কোনো গ্রাহকের বাকি নেই!</h3>
            <p className="text-xs text-slate-500 mt-1">
              সব গ্রাহকের হিসাব পরিশোধিত অথবা কোনো বাকি বিক্রি খুঁজে পাওয়া যায়নি।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
