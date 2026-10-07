export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'due' | 'mixed';

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface SaleRecord {
  id: string;
  memoNo: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  supplierName: string;
  supplierPhone?: string;
  itemName: string;
  quantity?: number;
  unit?: string;
  totalCost: number;
  paymentMethod: 'cash' | 'due' | 'bank' | 'bkash' | 'nagad';
  challanNo?: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'rent'
  | 'utility'
  | 'staff'
  | 'food'
  | 'transport'
  | 'supplies'
  | 'maintenance'
  | 'others';

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad';
}

export interface ShopProfile {
  name: string;
  propName: string;
  address: string;
  phone: string;
  whatsappNumber?: string;
  memoFooter: string;
  currency: string;
  useBengaliDigits: boolean;
}

export type DateFilterType = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'all' | 'custom';
