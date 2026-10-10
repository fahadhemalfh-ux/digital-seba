import React, { useState } from 'react';
import {
  Settings,
  X,
  Save,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Store,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Printer,
  Sliders,
  Check,
} from 'lucide-react';
import { ExpenseRecord, PurchaseRecord, SaleRecord, ShopProfile } from '../types';
import { exportToCSV, getTodayDateString } from '../utils/helpers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopProfile: ShopProfile;
  onUpdateShopProfile: (updated: ShopProfile) => void;
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  expenses: ExpenseRecord[];
  onRestoreData: (data: {
    sales: SaleRecord[];
    purchases: PurchaseRecord[];
    expenses: ExpenseRecord[];
    shopProfile?: ShopProfile;
  }) => void;
  onResetDemoData: () => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  shopProfile,
  onUpdateShopProfile,
  sales,
  purchases,
  expenses,
  onRestoreData,
  onResetDemoData,
  onClearAllData,
}) => {
  const [name, setName] = useState(shopProfile.name);
  const [propName, setPropName] = useState(shopProfile.propName);
  const [address, setAddress] = useState(shopProfile.address);
  const [phone, setPhone] = useState(shopProfile.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(shopProfile.whatsappNumber || '');
  const [memoFooter, setMemoFooter] = useState(shopProfile.memoFooter);
  const [useBengaliDigits, setUseBengaliDigits] = useState(shopProfile.useBengaliDigits);
  const [printMarginTop, setPrintMarginTop] = useState<number>(shopProfile.printMarginTop ?? 6);
  const [printMarginBottom, setPrintMarginBottom] = useState<number>(shopProfile.printMarginBottom ?? 6);
  const [printMarginLeft, setPrintMarginLeft] = useState<number>(shopProfile.printMarginLeft ?? 8);
  const [printMarginRight, setPrintMarginRight] = useState<number>(shopProfile.printMarginRight ?? 8);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (top: number, bottom: number, left: number, right: number) => {
    setPrintMarginTop(top);
    setPrintMarginBottom(bottom);
    setPrintMarginLeft(left);
    setPrintMarginRight(right);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ShopProfile = {
      ...shopProfile,
      name: name.trim(),
      propName: propName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      whatsappNumber: whatsappNumber.trim(),
      memoFooter: memoFooter.trim(),
      useBengaliDigits,
      printMarginTop: Number(printMarginTop) >= 0 ? Number(printMarginTop) : 6,
      printMarginBottom: Number(printMarginBottom) >= 0 ? Number(printMarginBottom) : 6,
      printMarginLeft: Number(printMarginLeft) >= 0 ? Number(printMarginLeft) : 8,
      printMarginRight: Number(printMarginRight) >= 0 ? Number(printMarginRight) : 8,
    };
    onUpdateShopProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Full JSON Backup
  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      shopProfile: {
        name,
        propName,
        address,
        phone,
        whatsappNumber,
        memoFooter,
        useBengaliDigits,
        printMarginTop,
        printMarginBottom,
        printMarginLeft,
        printMarginRight,
      },
      sales,
      purchases,
      expenses,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DokanKhata_FullBackup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // File Upload Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && (parsed.sales || parsed.purchases || parsed.expenses)) {
            onRestoreData({
              sales: parsed.sales || [],
              purchases: parsed.purchases || [],
              expenses: parsed.expenses || [],
              shopProfile: parsed.shopProfile,
            });
            alert('সফলভাবে পূর্বের ব্যাকআপ ডাটা রিস্টোর করা হয়েছে!');
            onClose();
          } else {
            alert('ভুল ফাইল ফরম্যাট! সঠিক DokanKhata ব্যাকআপ JSON ফাইল সিলেক্ট করুন।');
          }
        } catch (err) {
          alert('ফাইলটি পড়া যায়নি। অনুগ্রহ করে সঠিক JSON ফাইল প্রদান করুন।');
        }
      };
    }
  };

  const handleExportAllToCSV = () => {
    // Export Sales
    const salesData = sales.map((s) => ({
      'মেমো নং': s.memoNo,
      'তারিখ': s.date,
      'গ্রাহক': s.customerName,
      'মোবাইল': s.customerPhone,
      'মোট বিল': s.grandTotal,
      'পরিশোধ': s.paidAmount,
      'বাকি': s.dueAmount,
      'পেমেন্ট মাধ্যম': s.paymentMethod,
    }));
    exportToCSV(salesData, `DokanKhata_AllSales_${getTodayDateString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">দোকানের তথ্য, প্রিন্ট মার্জিন ও ডাটা ব্যাকআপ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Shop Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" />
                দোকানের প্রোফাইল ও ক্যাশ মেমো হেডার
              </h4>
              {saveSuccess && (
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> সংরক্ষিত হয়েছে!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  দোকান / প্রতিষ্ঠানের নাম *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  স্বত্বাধিকারী / প্রোপ্রাইটর
                </label>
                <input
                  type="text"
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  দোকানের পূর্ণ ঠিকানা *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  মোবাইল / হেল্পলাইন নম্বর *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  হোয়াটসঅ্যাপ নম্বর (WhatsApp)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="018xxxxxxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  সংখ্যার ধরন (Digits)
                </label>
                <div className="flex items-center gap-2 pt-2">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="digits"
                      checked={!useBengaliDigits}
                      onChange={() => setUseBengaliDigits(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>ইংরেজি সংখ্যা (0, 1, 2)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer ml-3">
                    <input
                      type="radio"
                      name="digits"
                      checked={useBengaliDigits}
                      onChange={() => setUseBengaliDigits(true)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>বাংলা সংখ্যা (০, ১, ২)</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  মেমোর নিচের শর্তাবলী / স্লোগান
                </label>
                <input
                  type="text"
                  value={memoFooter}
                  onChange={(e) => setMemoFooter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Print Margins & Single-Page Settings Section */}
            <div className="border-t border-slate-200 pt-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-teal-600" />
                  ক্যাশ মেমো প্রিন্ট মার্জিন সেটিংস (Print Margins)
                </h4>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  ১-পেজ ফুল ফিট
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                আপনার প্রিন্টারের সাথে মিলিয়ে মেমোর চারপাশের মার্জিন কাস্টমাইজ করুন। ১টি পাতায় সম্পূর্ণ মেমো প্রিন্ট করতে ডিফল্ট বা ৪-৬ মিমি মার্জিন ব্যবহারের পরামর্শ দেওয়া হচ্ছে।
              </p>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">
                  দ্রুত মার্জিন প্রিসেট (Quick Presets):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(6, 6, 8, 8)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                      printMarginTop === 6 && printMarginBottom === 6 && printMarginLeft === 8 && printMarginRight === 8
                        ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">১-পেজ পারফেক্ট</span>
                      {printMarginTop === 6 && printMarginBottom === 6 && printMarginLeft === 8 && printMarginRight === 8 && (
                        <Check className="w-3 h-3 text-teal-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">৬mm / ৮mm (ডিফল্ট)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset(4, 4, 5, 5)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                      printMarginTop === 4 && printMarginBottom === 4 && printMarginLeft === 5 && printMarginRight === 5
                        ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">ন্যূনতম / ন্যারো</span>
                      {printMarginTop === 4 && printMarginBottom === 4 && printMarginLeft === 5 && printMarginRight === 5 && (
                        <Check className="w-3 h-3 text-teal-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">৪mm / ৫mm (কম্প্যাক্ট)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset(2, 2, 3, 3)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                      printMarginTop === 2 && printMarginBottom === 2 && printMarginLeft === 3 && printMarginRight === 3
                        ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">জিরো / ফুল পেজ</span>
                      {printMarginTop === 2 && printMarginBottom === 2 && printMarginLeft === 3 && printMarginRight === 3 && (
                        <Check className="w-3 h-3 text-teal-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">২mm / ৩mm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset(10, 10, 12, 12)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                      printMarginTop === 10 && printMarginBottom === 10 && printMarginLeft === 12 && printMarginRight === 12
                        ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">প্রশস্ত মার্জিন</span>
                      {printMarginTop === 10 && printMarginBottom === 10 && printMarginLeft === 12 && printMarginRight === 12 && (
                        <Check className="w-3 h-3 text-teal-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">১০mm / ১২mm</div>
                  </button>
                </div>
              </div>

              {/* Manual Margin Adjustment Grid */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-600" />
                    ম্যানুয়াল মার্জিন ইনপুট (মিমি / mm):
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    উপর: {printMarginTop}mm | নিচ: {printMarginBottom}mm | বাম: {printMarginLeft}mm | ডান: {printMarginRight}mm
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      উপর (Top)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="1"
                        value={printMarginTop}
                        onChange={(e) => setPrintMarginTop(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold pr-8"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-medium">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      নিচ (Bottom)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="1"
                        value={printMarginBottom}
                        onChange={(e) => setPrintMarginBottom(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold pr-8"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-medium">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      বাম (Left)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="1"
                        value={printMarginLeft}
                        onChange={(e) => setPrintMarginLeft(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold pr-8"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-medium">mm</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-1">
                      ডান (Right)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        step="1"
                        value={printMarginRight}
                        onChange={(e) => setPrintMarginRight(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold pr-8"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-medium">mm</span>
                    </div>
                  </div>
                </div>

                {/* Print Guide Tips Box */}
                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-lg space-y-1 text-[11px] text-teal-950">
                  <div className="font-bold text-teal-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                    ১ পেজে নিখুঁত মেমো প্রিন্ট করার নির্দেশিকা:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-teal-800">
                    <li>প্রিন্ট ডায়ালগে (Ctrl + P) <strong>Margins</strong> অপশন <strong>Default</strong> অথবা <strong>None</strong> রাখুন।</li>
                    <li>ব্রাউজারের <strong>More settings</strong> থেকে <strong>Headers and footers</strong> অপশনটি <strong>আনচেক (তুলে দিন)</strong> রাখুন যাতে অতিরিক্ত তারিখ/হেডার না আসে।</li>
                    <li>প্রিন্ট মার্জিন ৪-৬ মিমি রাখলে পুরো মেমোটি ১ পৃষ্ঠায় সুন্দরভাবে আঁটবে, ৩ পাতায় কখনোই ছড়াবে না।</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>সকল তথ্য ও মার্জিন সেটিংস সেভ করুন</span>
              </button>
            </div>
          </form>

          {/* Backup & Export Section */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              ডাটা ব্যাকআপ ও এক্সপোর্ট (Data Storage & Backup)
            </h4>
            <p className="text-slate-500 text-[11px]">
              আপনার যাবতীয় হিসাব স্বয়ংক্রিয়ভাবে ব্রাউজারের <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">localStorage</code>-এ সংরক্ষিত থাকে। কম্পিউটার পরিবর্তন বা ব্যাকআপ রাখতে ফাইল নামিয়ে রাখুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleDownloadBackup}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-left flex items-start gap-2.5 transition-colors"
              >
                <Download className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-indigo-900">সম্পূর্ণ ব্যাকআপ ডাউনলোড</div>
                  <div className="text-[11px] text-indigo-700 mt-0.5">
                    JSON ফাইলে বিক্রয়, ক্রয়, খরচ ও সেটিংস সেভ করুন
                  </div>
                </div>
              </button>

              <label className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-start gap-2.5 transition-colors cursor-pointer">
                <Upload className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">ব্যাকআপ ফাইল রিস্টোর</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    পূর্বের নামানো JSON ফাইল আপলোড করে ফিরিয়ে আনুন
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={handleExportAllToCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>সকল বিক্রয় এক্সেল/CSV ফাইলে ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Danger Zone: Reset or Clear */}
          <div className="border-t border-rose-200 bg-rose-50/50 p-4 rounded-xl space-y-3">
            <h4 className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              রিসেট ও সতর্কতা জোন (Danger Zone)
            </h4>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (confirm('আপনি কি ডেমো নমুনা ডাটা পুনরায় লোড করতে চান?')) {
                    onResetDemoData();
                    alert('নমুনা ডাটা পুনরায় লোড করা হয়েছে!');
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>নমুনা ডাটা পুনরায় লোড করুন</span>
              </button>

              <button
                onClick={() => {
                  if (
                    confirm(
                      'সতর্কতা: আপনি কি নিশ্চিত যে আপনি সমস্ত বিক্রয়, ক্রয় ও খরচের ডাটা মুছে ফেলে সম্পূর্ণ নতুন খালি হিসাব শুরু করতে চান?'
                    )
                  ) {
                    onClearAllData();
                    alert('সমস্ত ডাটা মুছে ফেলা হয়েছে!');
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সব ডাটা মুছে ফেলুন (Clear All)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
