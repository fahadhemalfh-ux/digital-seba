import React, { useState } from 'react';
import { Printer, X, FileText, SlidersHorizontal, Check } from 'lucide-react';
import { ShopProfile } from '../types';

interface BlankMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopProfile: ShopProfile;
}

export const BlankMemoModal: React.FC<BlankMemoModalProps> = ({
  isOpen,
  onClose,
  shopProfile,
}) => {
  const [rowCount, setRowCount] = useState<number>(10);
  const [copiesPerPage, setCopiesPerPage] = useState<1 | 2>(1);
  const [shopName, setShopName] = useState(shopProfile.name);
  const [propName, setPropName] = useState(shopProfile.propName);
  const [shopAddress, setShopAddress] = useState(shopProfile.address);
  const [shopPhone, setShopPhone] = useState(shopProfile.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(shopProfile.whatsappNumber || '');
  const [memoFooter, setMemoFooter] = useState(shopProfile.memoFooter);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const renderSingleMemo = (copyIndex: number) => {
    const isHalf = copiesPerPage === 2;
    const effectiveRows = isHalf ? 5 : rowCount;

    return (
      <div
        key={copyIndex}
        className={`${
          isHalf ? 'a4-half-sheet' : 'a4-memo-sheet'
        } bg-white text-slate-900 p-6 sm:p-7 rounded-xl border-2 border-slate-900 shadow-md font-sans mb-6 last:mb-0 print:border-slate-900 print:shadow-none print:m-0 print:rounded-none`}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-slate-900 pb-2 mb-2.5 print:pb-1.5 print:mb-2">
          <h2 className={`${isHalf ? 'text-lg sm:text-xl print:text-lg' : 'text-xl sm:text-2xl print:text-xl'} font-black text-slate-950 tracking-tight leading-tight`}>
            {shopName}
          </h2>
          {propName && (
            <div className="text-xs text-slate-800 font-bold mt-0.5">
              প্রোপ্রাইটর: {propName}
            </div>
          )}
          <p className="text-xs text-slate-700 font-medium mt-0.5">{shopAddress}</p>
          <p className="text-xs text-slate-800 font-semibold mt-0.5">
            মোবাইল: {shopPhone} {whatsappNumber ? `| হোয়াটসঅ্যাপ: ${whatsappNumber}` : ''}
          </p>
          <div className="inline-block mt-1.5 print:mt-1 px-3 py-0.5 border border-slate-900 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xs">
            ক্যাশ মেমো / CASH MEMO
          </div>
        </div>

        {/* Customer & Memo Details */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-2.5 pb-2 print:mb-1.5 print:pb-1 border-b border-slate-300">
          <div className="space-y-1.5 print:space-y-1">
            <div className="flex items-center">
              <span className="font-bold whitespace-nowrap text-slate-900 w-16">মেমো নং:</span>
              <span className="border-b border-dotted border-slate-500 flex-1 h-4"></span>
            </div>
            <div className="flex items-center">
              <span className="font-bold whitespace-nowrap text-slate-900 w-16">ক্রেতার নাম:</span>
              <span className="border-b border-dotted border-slate-500 flex-1 h-4"></span>
            </div>
            <div className="flex items-center">
              <span className="font-bold whitespace-nowrap text-slate-900 w-16">ঠিকানা:</span>
              <span className="border-b border-dotted border-slate-500 flex-1 h-4"></span>
            </div>
          </div>

          <div className="space-y-1.5 print:space-y-1">
            <div className="flex items-center">
              <span className="font-bold whitespace-nowrap text-slate-900 w-14">তারিখ:</span>
              <span className="border-b border-dotted border-slate-500 flex-1 h-4"></span>
            </div>
            <div className="flex items-center">
              <span className="font-bold whitespace-nowrap text-slate-900 w-14">মোবাইল:</span>
              <span className="border-b border-dotted border-slate-500 flex-1 h-4"></span>
            </div>
          </div>
        </div>

        {/* Blank Lines Table */}
        <div className="mb-2.5 print:mb-1.5">
          <table className="w-full border-collapse border border-slate-900 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-950 border-b border-slate-900 font-bold">
                <th className="border-r border-slate-900 p-1 print:py-0.5 text-center w-10">নং</th>
                <th className="border-r border-slate-900 p-1 print:py-0.5 text-left">পণ্যের বিবরণ</th>
                <th className="border-r border-slate-900 p-1 print:py-0.5 text-center w-16">পরিমাণ</th>
                <th className="border-r border-slate-900 p-1 print:py-0.5 text-right w-20">দর (টাকা)</th>
                <th className="p-1 print:py-0.5 text-right w-24">মোট টাকা</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: effectiveRows }).map((_, i) => (
                <tr key={i} className="border-b border-slate-400 h-6 print:h-5">
                  <td className="border-r border-slate-900 text-center text-slate-500 font-mono text-[11px] print:py-0.5">
                    {i + 1}
                  </td>
                  <td className="border-r border-slate-900 print:py-0.5"></td>
                  <td className="border-r border-slate-900 print:py-0.5"></td>
                  <td className="border-r border-slate-900 print:py-0.5"></td>
                  <td className="print:py-0.5"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* In Words & Totals Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3 print:mb-1.5">
          <div className="flex flex-col justify-between space-y-1.5">
            <div>
              <div className="font-bold text-slate-900 mb-0.5">কথায়:</div>
              <div className="border-b border-dotted border-slate-500 h-5"></div>
              <div className="border-b border-dotted border-slate-500 h-5 mt-1"></div>
            </div>

            <div className="text-[11px] text-slate-600 border-t border-slate-300 pt-1 font-medium">
              * {memoFooter}
            </div>
          </div>

          <div className="border border-slate-900 rounded-sm p-2 print:p-1.5 text-xs space-y-1 bg-slate-50/20">
            <div className="flex justify-between items-center border-b border-dotted border-slate-300 pb-0.5">
              <span className="font-medium">মোট বিল (Subtotal):</span>
              <span className="w-20 border-b border-slate-400 h-3.5"></span>
            </div>
            <div className="flex justify-between items-center border-b border-dotted border-slate-300 pb-0.5">
              <span className="font-medium">কমিশন / ছাড় (Discount):</span>
              <span className="w-20 border-b border-slate-400 h-3.5"></span>
            </div>
            <div className="flex justify-between items-center font-bold border-b border-slate-900 pb-0.5">
              <span>সর্বমোট (Grand Total):</span>
              <span className="w-20 border-b border-slate-900 h-3.5"></span>
            </div>
            <div className="flex justify-between items-center border-b border-dotted border-slate-300 pb-0.5">
              <span className="font-medium">জমা / নগদ (Paid):</span>
              <span className="w-20 border-b border-slate-400 h-3.5"></span>
            </div>
            <div className="flex justify-between items-center font-bold text-slate-950">
              <span>বকেয়া (Due):</span>
              <span className="w-20 border-b border-slate-900 h-3.5"></span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-auto pt-4 print:pt-3 print:pb-0.5 flex justify-between items-end text-xs text-slate-900">
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
    );
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:m-0 print:bg-white print:static">
      <div className="modal-container bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto border border-slate-200 print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Top Control Bar */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  খালি ক্যাশ মেমো টেমপ্লেট (Blank Cash Memo)
                </h3>
                <span className="text-[11px] bg-amber-950 text-amber-300 font-medium px-2 py-0.5 rounded border border-amber-700 hidden sm:inline-flex items-center gap-1">
                  <span>মার্জিন: {shopProfile.printMarginTop ?? 6}mm</span>
                  <span className="text-amber-400 font-bold">• ১ পেজ ফিট</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                দোকানের সিল ও নামসহ পরিষ্কার খালি মেমো প্রিন্ট করুন হাতে লেখার জন্য।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>খালি মেমো প্রিন্ট করুন</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Toolbar (hidden on print) */}
        <div className="no-print bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-700">খালি সারির সংখ্যা:</span>
              <select
                value={rowCount}
                onChange={(e) => setRowCount(Number(e.target.value))}
                className="px-2 py-1 border border-slate-300 rounded bg-white text-xs font-semibold"
              >
                <option value={8}>৮ টি সারি (কম্প্যাক্ট)</option>
                <option value={10}>১০ টি সারি (স্ট্যান্ডার্ড A4)</option>
                <option value={11}>১১ টি সারি (১-পেজ ফিট)</option>
                <option value={12}>১২ টি সারি (A4 ফুল পেজ)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-700">প্রতি পাতায় কপি:</span>
              <button
                type="button"
                onClick={() => setCopiesPerPage(1)}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  copiesPerPage === 1
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                ১ কপি (Full Page)
              </button>
              <button
                type="button"
                onClick={() => setCopiesPerPage(2)}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  copiesPerPage === 2
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-300 text-slate-700'
                }`}
              >
                ২ কপি (Half Page)
              </button>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            * প্রিন্ট বাটনে চাপ দিলে সরাসরি প্রিন্টার বা সেভ অ্যাজ পিডিএফ (Save as PDF) দেখতে পাবেন।
          </div>
        </div>

        {/* Scrollable Printable Area */}
        <div className="modal-scroll-area overflow-y-auto p-4 sm:p-8 bg-slate-200 flex flex-col items-center print:p-0 print:bg-white print:overflow-visible">
          <div className="w-full max-w-2xl print:max-w-full">
            {copiesPerPage === 1 ? (
              renderSingleMemo(1)
            ) : (
              <div className="space-y-6 print:space-y-4">
                {renderSingleMemo(1)}
                <div className="no-print border-b-2 border-dashed border-slate-400 my-4 text-center text-xs text-slate-500 font-mono">
                  - - - - - - - - - এখান থেকে কাটুন (Cut Here) - - - - - - - - -
                </div>
                {renderSingleMemo(2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
