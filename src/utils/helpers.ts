import { DateFilterType } from '../types';

export const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
};

export const formatCurrency = (amount: number, useBengali = false): string => {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return useBengali ? `৳ ${toBengaliDigits(formatted)}` : `৳ ${formatted}`;
};

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

export const formatDisplayDate = (dateStr: string, useBengali = false): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const monthsBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const mIndex = parseInt(month, 10) - 1;
  const monthName = monthsBn[mIndex] || month;

  if (useBengali) {
    return `${toBengaliDigits(day)} ${monthName}, ${toBengaliDigits(year)}`;
  }
  return `${day} ${monthName} ${year}`;
};

export const isDateInRange = (
  dateStr: string,
  filter: DateFilterType,
  customStart?: string,
  customEnd?: string
): boolean => {
  if (filter === 'all') return true;
  if (!dateStr) return false;

  const targetDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filter === 'today') {
    return targetDate.getTime() === today.getTime();
  }

  if (filter === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return targetDate.getTime() === yesterday.getTime();
  }

  if (filter === 'this_week') {
    const startOfWeek = new Date(today);
    const day = today.getDay();
    // Assuming week starts on Saturday (common in Bangladesh) or Sunday
    const diff = today.getDate() - day;
    startOfWeek.setDate(diff);
    return targetDate >= startOfWeek && targetDate <= today;
  }

  if (filter === 'this_month') {
    return (
      targetDate.getFullYear() === today.getFullYear() &&
      targetDate.getMonth() === today.getMonth()
    );
  }

  if (filter === 'custom' && customStart && customEnd) {
    const start = new Date(customStart + 'T00:00:00');
    const end = new Date(customEnd + 'T23:59:59');
    return targetDate >= start && targetDate <= end;
  }

  return true;
};

// Export to CSV helper
export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data || !data.length) {
    alert('এক্সপোর্ট করার মতো কোনো তথ্য নেই!');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const val = row[header];
          const escaped = ('' + (val ?? '')).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ];

  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Number to Bengali words (for invoice/memo)
export const numberToBengaliWords = (n: number): string => {
  if (isNaN(n) || n === 0) return 'শূন্য';

  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
    'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ'];
  const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];

  const convertTwoDigits = (num: number): string => {
    if (num === 0) return '';
    if (num < 20) return units[num];
    const t = Math.floor(num / 10);
    const u = num % 10;
    return `${tens[t]}${u > 0 ? ' ' + units[u] : ''}`;
  };

  const integerPart = Math.floor(n);
  let words = '';

  const crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundred = Math.floor(remainder / 100);
  const rest = remainder % 100;

  if (crore > 0) words += `${convertTwoDigits(crore)} কোটি `;
  if (lakh > 0) words += `${convertTwoDigits(lakh)} লাখ `;
  if (thousand > 0) words += `${convertTwoDigits(thousand)} হাজার `;
  if (hundred > 0) words += `${units[hundred]} শত `;
  if (rest > 0) words += `${convertTwoDigits(rest)} `;

  return words.trim() + ' টাকা মাত্র';
};
