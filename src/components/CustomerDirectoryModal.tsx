import React, { useState } from 'react';
import {
  Users,
  X,
  Phone,
  MessageSquare,
  Search,
  BookOpen,
  ArrowRight,
  User,
  ShoppingBag,
} from 'lucide-react';
import { SaleRecord, ShopProfile } from '../types';
import { formatCurrency, formatDisplayDate } from '../utils/helpers';

interface CustomerDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleRecord[];
  shopProfile: ShopProfile;
  onSelectCustomerForSale?: (name: string, phone: string, address?: string) => void;
}

export const CustomerDirectoryModal: React.FC<CustomerDirectoryModalProps> = ({
  isOpen,
  onClose,
  sales,
  shopProfile,
  onSelectCustomerForSale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  if (!isOpen) return null;

  // Aggregate customers from sales
  interface CustomerSummary {
    name: string;
    phone: string;
    address?: string;
    totalSpent: number;
    totalDue: number;
    transactionCount: number;
    lastVisitDate: string;
  }

  const customerMap = sales.reduce((acc, sale) => {
    const key = (sale.customerPhone || sale.customerName).trim().toLowerCase();
    if (!acc[key]) {
      acc[key] = {
        name: sale.customerName || 'খুচরা গ্রাহক',
        phone: sale.customerPhone || '',
        address: sale.customerAddress || '',
        totalSpent: 0,
        totalDue: 0,
        transactionCount: 0,
        lastVisitDate: sale.date,
      };
    }
    acc[key].totalSpent += sale.grandTotal;
    acc[key].totalDue += sale.dueAmount;
    acc[key].transactionCount += 1;
    if (sale.date > acc[key].lastVisitDate) {
      acc[key].lastVisitDate = sale.date;
    }
    return acc;
  }, {} as Record<string, CustomerSummary>);

  const customersList = Object.values(customerMap).filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchDue = filterDueOnly ? c.totalDue > 0 : true;

    return matchSearch && matchDue;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">গ্রাহক তালিকা ও ফোনবুক (Customer Directory)</h3>
              <p className="text-[11px] text-slate-400">
                সকল নিয়মিত গ্রাহকদের তালিকা, মোট কেনাকাটা ও যোগাযোগের নম্বর
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="গ্রাহকের নাম বা মোবাইল দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
            />
          </div>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer self-start sm:self-auto font-medium">
            <input
              type="checkbox"
              checked={filterDueOnly}
              onChange={(e) => setFilterDueOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>শুধুমাত্র যাদের বাকি আছে ({Object.values(customerMap).filter((c) => c.totalDue > 0).length})</span>
          </label>
        </div>

        {/* Customer List */}
        <div className="overflow-y-auto p-5 divide-y divide-slate-100 text-xs">
          {customersList.map((customer) => (
            <div
              key={customer.phone || customer.name}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{customer.name}</span>
                    {customer.totalDue > 0 ? (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full">
                        বাকি {formatCurrency(customer.totalDue, shopProfile.useBengaliDigits)}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                        হিসাব ক্লিয়ার
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500 mt-1">
                    {customer.phone && (
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" /> {customer.phone}
                      </span>
                    )}
                    {customer.address && <span>ঠিকানা: {customer.address}</span>}
                    <span>• {customer.transactionCount} টি লেনদেন</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {customer.phone && (
                  <>
                    <a
                      href={`https://wa.me/88${customer.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      title="হোয়াটসঅ্যাপ বার্তা পাঠান"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    <a
                      href={`tel:${customer.phone}`}
                      className="p-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                      title="কল করুন"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </>
                )}

                {onSelectCustomerForSale && (
                  <button
                    onClick={() => {
                      onSelectCustomerForSale(customer.name, customer.phone, customer.address);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>নতুন বিক্রি</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {customersList.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              কোনো কাস্টমার খুঁজে পাওয়া যায়নি।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
