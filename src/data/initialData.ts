import { ExpenseRecord, PurchaseRecord, SaleRecord, ShopProfile } from '../types';
import { getTodayDateString } from '../utils/helpers';

export const defaultShopProfile: ShopProfile = {
  name: 'ডিজিটাল সেবা সেন্টার',
  propName: 'ফাহাদ',
  address: 'মেইন রোড, বাজার স্ট্যান্ড (ফটোকপি, কম্পিউটার কম্পোজ, অনলাইন আবেদন ও স্টেশনারি)',
  phone: '01690002828',
  whatsappNumber: '01871486546',
  memoFooter: 'সততাই আমাদের মূলধন। ডিজিটাল সেবা গ্রহণ ও কেনাকাটা করার জন্য ধন্যবাদ। আবার আসবেন।',
  currency: '৳',
  useBengaliDigits: false,
};

export const getInitialData = (): {
  sales: SaleRecord[];
  purchases: PurchaseRecord[];
  expenses: ExpenseRecord[];
} => {
  const today = getTodayDateString();
  const d = new Date();
  
  // Yesterday
  const yDate = new Date(d);
  yDate.setDate(d.getDate() - 1);
  const yesterday = yDate.toISOString().split('T')[0];

  // Two days ago
  const tDate = new Date(d);
  tDate.setDate(d.getDate() - 2);
  const twoDaysAgo = tDate.toISOString().split('T')[0];

  const sales: SaleRecord[] = [
    {
      id: 'sale-1',
      memoNo: 'MEMO-1001',
      date: today,
      time: '09:30 AM',
      customerName: 'মোঃ কামরুল হাসান',
      customerPhone: '01712-345678',
      customerAddress: 'কলেজ রোড',
      items: [
        { id: 'item-1', name: 'সরকারি চাকরির অনলাইন আবেদন ও এডমিট প্রিন্ট', quantity: 2, unit: 'সেট', unitPrice: 150, total: 300 },
        { id: 'item-2', name: 'পাসপোর্ট সাইজ ল্যাব প্রিন্ট ছবি (৪ কপি)', quantity: 2, unit: 'সেট', unitPrice: 80, total: 160 },
        { id: 'item-3', name: 'সার্টিফিকেট লেমিনেটিং', quantity: 3, unit: 'পিস', unitPrice: 30, total: 90 },
      ],
      subtotal: 550,
      discount: 20,
      grandTotal: 530,
      paidAmount: 530,
      dueAmount: 0,
      paymentMethod: 'cash',
      notes: 'নগদ পরিশোধিত',
    },
    {
      id: 'sale-2',
      memoNo: 'MEMO-1002',
      date: today,
      time: '11:15 AM',
      customerName: 'মাষ্টার রফিকুল ইসলাম',
      customerPhone: '01819-876543',
      customerAddress: 'মডেল হাই স্কুল',
      items: [
        { id: 'item-4', name: 'প্রশ্নপত্র ফটোকপি (A4 বোথ সাইড)', quantity: 180, unit: 'পাতা', unitPrice: 2.5, total: 450 },
        { id: 'item-5', name: 'ম্যাটাডোর অল-টাইম বলপেন (১ বক্স)', quantity: 1, unit: 'বক্স', unitPrice: 90, total: 90 },
        { id: 'item-6', name: 'বসুন্ধরা এক্সারসাইজ খাতা (১২০ পাতা)', quantity: 6, unit: 'পিস', unitPrice: 55, total: 330 },
      ],
      subtotal: 870,
      discount: 20,
      grandTotal: 850,
      paidAmount: 850,
      dueAmount: 0,
      paymentMethod: 'bkash',
      notes: 'বিকাশ নম্বর থেকে গৃহীত (TrxID: 9XF78L02)',
    },
    {
      id: 'sale-3',
      memoNo: 'MEMO-1003',
      date: today,
      time: '02:45 PM',
      customerName: 'তানভীর আহমেদ',
      customerPhone: '01911-223344',
      customerAddress: 'ইউনিয়ন পরিষদ রোড',
      items: [
        { id: 'item-7', name: 'জন্ম নিবন্ধন অনলাইন সংশোধন আবেদন ও ভেরিফিকেশন', quantity: 1, unit: 'সেবা', unitPrice: 250, total: 250 },
        { id: 'item-8', name: 'দলিল ও কাগজপত্র কম্পিউটার কম্পোজ (৫ পৃষ্ঠা)', quantity: 5, unit: 'পৃষ্ঠা', unitPrice: 60, total: 300 },
        { id: 'item-9', name: 'স্পাইরাল বাইন্ডিং (বড় সাইজ)', quantity: 2, unit: 'পিস', unitPrice: 70, total: 140 },
      ],
      subtotal: 690,
      discount: 0,
      grandTotal: 690,
      paidAmount: 400,
      dueAmount: 290,
      paymentMethod: 'mixed',
      notes: 'বাকি ২৯০ টাকা মূল কপি নেওয়ার সময় দিবে',
    },
    {
      id: 'sale-4',
      memoNo: 'MEMO-1004',
      date: today,
      time: '05:10 PM',
      customerName: 'আরিফুল ইসলাম সুজন',
      customerPhone: '01678-990011',
      customerAddress: 'বাজার পাড়া',
      items: [
        { id: 'item-10', name: 'ক্লাস নাইন-টেন গাইড বই ও টেস্ট পেপার', quantity: 2, unit: 'পিস', unitPrice: 420, total: 840 },
        { id: 'item-11', name: 'কালার ফটো প্রিন্ট এ৪ সাইজ', quantity: 4, unit: 'পাতা', unitPrice: 35, total: 140 },
      ],
      subtotal: 980,
      discount: 30,
      grandTotal: 950,
      paidAmount: 950,
      dueAmount: 0,
      paymentMethod: 'cash',
      notes: 'রেগুলার কাস্টমার',
    },
    {
      id: 'sale-5',
      memoNo: 'MEMO-0998',
      date: yesterday,
      time: '03:20 PM',
      customerName: 'নাজমুল হুদা',
      customerPhone: '01552-334455',
      items: [
        { id: 'item-12', name: 'জরুরি জমির পরচা ও খতিয়ান অনলাইন ডাউনলোড ও কালার প্রিন্ট', quantity: 2, unit: 'কপি', unitPrice: 120, total: 240 },
        { id: 'item-13', name: 'ফাইল ফোল্ডার ও ক্লিপ', quantity: 4, unit: 'পিস', unitPrice: 25, total: 100 },
      ],
      subtotal: 340,
      discount: 0,
      grandTotal: 340,
      paidAmount: 340,
      dueAmount: 0,
      paymentMethod: 'cash',
    },
    {
      id: 'sale-6',
      memoNo: 'MEMO-0995',
      date: twoDaysAgo,
      time: '11:00 AM',
      customerName: 'মেহেদী হাসান প্রিন্স',
      customerPhone: '01715-443322',
      items: [
        { id: 'item-14', name: 'এইচএসসি প্র্যাকটিক্যাল খাতা (৪টি)', quantity: 4, unit: 'পিস', unitPrice: 85, total: 340 },
        { id: 'item-15', name: 'জ্যামিতি বক্স ও ক্যালকুলেটর ব্যাটারি', quantity: 1, unit: 'সেট', unitPrice: 160, total: 160 },
      ],
      subtotal: 500,
      discount: 0,
      grandTotal: 500,
      paidAmount: 300,
      dueAmount: 200,
      paymentMethod: 'due',
      notes: 'পূর্বের বকেয়া ২০০ টাকা বাকি',
    },
  ];

  const purchases: PurchaseRecord[] = [
    {
      id: 'pur-1',
      date: today,
      supplierName: 'বাংলাবাজার পেপার এজেন্সি (ঢাকা)',
      supplierPhone: '01711-224466',
      itemName: 'বসুন্ধরা A4 ৮০ জিএসএম অফসেট পেপার (১০ রিম)',
      quantity: 10,
      unit: 'রিম',
      totalCost: 4800,
      paymentMethod: 'cash',
      challanNo: 'BB-4421',
      notes: 'ফটোকপি ও প্রিন্টের কাগজের স্টক ইন',
    },
    {
      id: 'pur-2',
      date: today,
      supplierName: 'আইটি ভ্যালি কম্পিউটার অ্যান্ড টোনার সাপ্লাই',
      supplierPhone: '01822-334455',
      itemName: 'এইচপি লেজারজেট টোনার কার্টিজ ১২এ (২টি) ও ব্ল্যাক ইঙ্ক বোতল',
      quantity: 3,
      unit: 'পিস',
      totalCost: 2600,
      paymentMethod: 'bkash',
      challanNo: 'IT-982',
      notes: 'প্রিন্টারের কালি ও টোনার',
    },
    {
      id: 'pur-3',
      date: yesterday,
      supplierName: 'জনতা স্টেশনারি হোলসেল',
      itemName: 'ম্যাটাডোর কলম বক্স, মার্কার, কারেকশন পেন ও বাইন্ডিং শিট',
      quantity: 20,
      unit: 'প্যাকেট',
      totalCost: 3500,
      paymentMethod: 'cash',
      challanNo: 'JS-112',
    },
  ];

  const expenses: ExpenseRecord[] = [
    {
      id: 'exp-1',
      date: today,
      category: 'utility',
      description: 'দোকানের হাই-স্পিড ব্রডব্যান্ড ইন্টারনেট মাসিক বিল',
      amount: 800,
      paymentMethod: 'bkash',
    },
    {
      id: 'exp-2',
      date: today,
      category: 'food',
      description: 'দোকানের বিকালের চা, বিস্কুট ও নাস্তা খরচ',
      amount: 120,
      paymentMethod: 'cash',
    },
    {
      id: 'exp-3',
      date: today,
      category: 'supplies',
      description: 'ফটোকপি মেশিনের ওয়েস্ট প্যাড ও রোলার ক্লিনিং',
      amount: 250,
      paymentMethod: 'cash',
    },
    {
      id: 'exp-4',
      date: yesterday,
      category: 'utility',
      description: 'দোকানের বাণিজ্যিক বিদ্যুৎ বিল পরিশোধ',
      amount: 1450,
      paymentMethod: 'cash',
    },
    {
      id: 'exp-5',
      date: twoDaysAgo,
      category: 'rent',
      description: 'দোকান ভাড়ার কিস্তি',
      amount: 3500,
      paymentMethod: 'cash',
    },
  ];

  return { sales, purchases, expenses };
};
