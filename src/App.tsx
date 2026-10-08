/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { SalesManager } from './components/SalesManager';
import { PurchaseManager } from './components/PurchaseManager';
import { ExpenseTracker } from './components/ExpenseTracker';
import { DueBook } from './components/DueBook';
import { CashMemoModal } from './components/CashMemoModal';
import { BlankMemoModal } from './components/BlankMemoModal';
import { SettingsModal } from './components/SettingsModal';
import { CashClosingModal } from './components/CashClosingModal';
import { RateChartModal } from './components/RateChartModal';
import { CustomerDirectoryModal } from './components/CustomerDirectoryModal';
import { QuickCalculatorModal } from './components/QuickCalculatorModal';
import { FloatingActionButton } from './components/FloatingActionButton';
import {
  CashClosingRecord,
  ExpenseRecord,
  PurchaseRecord,
  RateItem,
  SaleRecord,
  ShopProfile,
} from './types';
import { defaultRateList, defaultShopProfile, getInitialData } from './data/initialData';
import { getTodayDateString } from './utils/helpers';

export default function App() {
  // 1. Shop Profile
  const [shopProfile, setShopProfile] = useState<ShopProfile>(() => {
    try {
      const saved = localStorage.getItem('dokankhata_shop_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If old placeholder, upgrade to user's real business profile
        if (
          parsed.name?.includes('আল-মদিনা') ||
          parsed.name?.includes('লাইব্রেরী') ||
          !parsed.phone?.includes('01690002828')
        ) {
          localStorage.setItem('dokankhata_shop_profile', JSON.stringify(defaultShopProfile));
          return defaultShopProfile;
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultShopProfile;
  });

  // 2. Sales Records
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem('dokankhata_sales');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getInitialData().sales;
  });

  // 3. Purchase Records
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('dokankhata_purchases');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getInitialData().purchases;
  });

  // 4. Expense Records
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('dokankhata_expenses');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return getInitialData().expenses;
  });

  // 5. Digital Rate Chart Catalog
  const [rateList, setRateList] = useState<RateItem[]>(() => {
    try {
      const saved = localStorage.getItem('digital_seba_rates');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultRateList;
  });

  // 6. Cash Closing Records History
  const [cashClosings, setCashClosings] = useState<CashClosingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('digital_seba_closings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal States
  const [isDigitalMemoOpen, setIsDigitalMemoOpen] = useState(false);
  const [selectedMemoSale, setSelectedMemoSale] = useState<SaleRecord | null>(null);
  const [isBlankMemoOpen, setIsBlankMemoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCashClosingOpen, setIsCashClosingOpen] = useState(false);
  const [isRateChartOpen, setIsRateChartOpen] = useState(false);
  const [isCustomerDirectoryOpen, setIsCustomerDirectoryOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Cross-trigger prefill states
  const [autoOpenSaleForm, setAutoOpenSaleForm] = useState(false);
  const [prefillCustomerForSale, setPrefillCustomerForSale] = useState<{
    name: string;
    phone: string;
    address?: string;
  } | null>(null);
  const [prefillServiceForSale, setPrefillServiceForSale] = useState<{
    name: string;
    unit: string;
    price: number;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dokankhata_shop_profile', JSON.stringify(shopProfile));
    } catch (e) {
      console.error(e);
    }
  }, [shopProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('dokankhata_sales', JSON.stringify(sales));
    } catch (e) {
      console.error(e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem('dokankhata_purchases', JSON.stringify(purchases));
    } catch (e) {
      console.error(e);
    }
  }, [purchases]);

  useEffect(() => {
    try {
      localStorage.setItem('dokankhata_expenses', JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('digital_seba_rates', JSON.stringify(rateList));
    } catch (e) {
      console.error(e);
    }
  }, [rateList]);

  useEffect(() => {
    try {
      localStorage.setItem('digital_seba_closings', JSON.stringify(cashClosings));
    } catch (e) {
      console.error(e);
    }
  }, [cashClosings]);

  // Handlers for Sales
  const handleAddSale = (newSale: SaleRecord) => {
    setSales((prev) => [newSale, ...prev]);
  };

  const handleUpdateSale = (updatedSale: SaleRecord) => {
    setSales((prev) => prev.map((s) => (s.id === updatedSale.id ? updatedSale : s)));
  };

  const handleDeleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  // Handlers for Purchases
  const handleAddPurchase = (newPurchase: PurchaseRecord) => {
    setPurchases((prev) => [newPurchase, ...prev]);
  };

  const handleDeletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  // Handlers for Expenses
  const handleAddExpense = (newExpense: ExpenseRecord) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Handlers for Rate List
  const handleAddRateItem = (newItem: RateItem) => {
    setRateList((prev) => [newItem, ...prev]);
  };

  const handleDeleteRateItem = (id: string) => {
    setRateList((prev) => prev.filter((r) => r.id !== id));
  };

  // Handlers for Cash Closing
  const handleSaveClosingRecord = (record: CashClosingRecord) => {
    setCashClosings((prev) => [record, ...prev]);
  };

  // Trigger Memo View
  const handleOpenDigitalMemo = (sale?: SaleRecord) => {
    setSelectedMemoSale(sale || null);
    setIsDigitalMemoOpen(true);
  };

  // Reset to Demo Sample Data
  const handleResetDemoData = () => {
    const initial = getInitialData();
    setSales(initial.sales);
    setPurchases(initial.purchases);
    setExpenses(initial.expenses);
    setRateList(defaultRateList);
    setShopProfile(defaultShopProfile);
  };

  // Clear All Records
  const handleClearAllData = () => {
    setSales([]);
    setPurchases([]);
    setExpenses([]);
    setCashClosings([]);
  };

  // Restore from JSON backup file
  const handleRestoreData = (data: {
    sales: SaleRecord[];
    purchases: PurchaseRecord[];
    expenses: ExpenseRecord[];
    shopProfile?: ShopProfile;
  }) => {
    if (data.sales) setSales(data.sales);
    if (data.purchases) setPurchases(data.purchases);
    if (data.expenses) setExpenses(data.expenses);
    if (data.shopProfile) setShopProfile(data.shopProfile);
  };

  // Calculate Today's Expected System Cash
  const todayStr = getTodayDateString();
  const todayReceivedCash = sales
    .filter((s) => s.date === todayStr)
    .reduce((acc, curr) => acc + curr.paidAmount, 0);

  const todayPurchaseCashOut = purchases
    .filter((p) => p.date === todayStr && p.paymentMethod !== 'due')
    .reduce((acc, curr) => acc + curr.totalCost, 0);

  const todayExpenseCashOut = expenses
    .filter((e) => e.date === todayStr && e.paymentMethod === 'cash')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todaySystemCash = todayReceivedCash - todayPurchaseCashOut - todayExpenseCashOut;

  // Open Sale form with specific customer or service
  const handleQuickSaleWithCustomer = (name: string, phone: string, address?: string) => {
    setPrefillCustomerForSale({ name, phone, address });
    setActiveTab('sales');
    setAutoOpenSaleForm(true);
  };

  const handleQuickSaleWithService = (service: RateItem) => {
    setPrefillServiceForSale({ name: service.name, unit: service.unit, price: service.price });
    setActiveTab('sales');
    setAutoOpenSaleForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Top Navigation & Brand Header */}
      <Header
        shopProfile={shopProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickSale={() => {
          setActiveTab('sales');
          setAutoOpenSaleForm(true);
        }}
        onOpenQuickPurchase={() => setActiveTab('purchases')}
        onOpenQuickExpense={() => setActiveTab('expenses')}
        onOpenDigitalMemo={() => handleOpenDigitalMemo()}
        onOpenBlankMemo={() => setIsBlankMemoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCashClosing={() => setIsCashClosingOpen(true)}
        onOpenRateChart={() => setIsRateChartOpen(true)}
        onOpenCustomerDirectory={() => setIsCustomerDirectoryOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            sales={sales}
            purchases={purchases}
            expenses={expenses}
            shopProfile={shopProfile}
            onOpenQuickSale={() => {
              setActiveTab('sales');
              setAutoOpenSaleForm(true);
            }}
            onOpenQuickPurchase={() => setActiveTab('purchases')}
            onOpenQuickExpense={() => setActiveTab('expenses')}
            onOpenDigitalMemo={handleOpenDigitalMemo}
            onOpenBlankMemo={() => setIsBlankMemoOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'sales' && (
          <SalesManager
            sales={sales}
            onAddSale={handleAddSale}
            onDeleteSale={handleDeleteSale}
            shopProfile={shopProfile}
            onOpenDigitalMemo={handleOpenDigitalMemo}
            autoOpenForm={autoOpenSaleForm}
            prefillCustomer={prefillCustomerForSale}
            prefillService={prefillServiceForSale}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchaseManager
            purchases={purchases}
            onAddPurchase={handleAddPurchase}
            onDeletePurchase={handleDeletePurchase}
            shopProfile={shopProfile}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTracker
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            shopProfile={shopProfile}
          />
        )}

        {activeTab === 'dues' && (
          <DueBook
            sales={sales}
            onUpdateSale={handleUpdateSale}
            shopProfile={shopProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-800">{shopProfile.name}</span> — ডিজিটাল রিটেইল ক্যাশ খাতা
          </div>
          <div className="text-[11px] text-slate-400">
            সম্পূর্ণ নিরাপদ ও লোকাল স্টোরেজে সংরক্ষিত • প্রিন্ট এবং পিডিএফ প্রস্তুত
          </div>
        </div>
      </footer>

      {/* Floating Action Button (FAB) */}
      <FloatingActionButton
        onOpenSale={() => {
          setActiveTab('sales');
          setAutoOpenSaleForm(true);
        }}
        onOpenPurchase={() => setActiveTab('purchases')}
        onOpenExpense={() => setActiveTab('expenses')}
        onOpenMemo={() => handleOpenDigitalMemo()}
        onOpenCashClosing={() => setIsCashClosingOpen(true)}
        onOpenRateChart={() => setIsRateChartOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      {/* Digital Cash Memo Modal */}
      <CashMemoModal
        isOpen={isDigitalMemoOpen}
        onClose={() => {
          setIsDigitalMemoOpen(false);
          setSelectedMemoSale(null);
        }}
        initialSale={selectedMemoSale}
        shopProfile={shopProfile}
        onSaveToSales={handleAddSale}
      />

      {/* Blank Cash Memo Modal */}
      <BlankMemoModal
        isOpen={isBlankMemoOpen}
        onClose={() => setIsBlankMemoOpen(false)}
        shopProfile={shopProfile}
      />

      {/* Cash Closing Modal */}
      <CashClosingModal
        isOpen={isCashClosingOpen}
        onClose={() => setIsCashClosingOpen(false)}
        shopProfile={shopProfile}
        todaySystemCash={todaySystemCash}
        onSaveClosingRecord={handleSaveClosingRecord}
        savedClosings={cashClosings}
      />

      {/* Rate Chart Modal */}
      <RateChartModal
        isOpen={isRateChartOpen}
        onClose={() => setIsRateChartOpen(false)}
        shopProfile={shopProfile}
        rateList={rateList}
        onAddRateItem={handleAddRateItem}
        onDeleteRateItem={handleDeleteRateItem}
        onSelectServiceToSale={handleQuickSaleWithService}
      />

      {/* Customer Directory Modal */}
      <CustomerDirectoryModal
        isOpen={isCustomerDirectoryOpen}
        onClose={() => setIsCustomerDirectoryOpen(false)}
        sales={sales}
        shopProfile={shopProfile}
        onSelectCustomerForSale={handleQuickSaleWithCustomer}
      />

      {/* Quick Calculator Modal */}
      <QuickCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        shopProfile={shopProfile}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        shopProfile={shopProfile}
        onUpdateShopProfile={setShopProfile}
        sales={sales}
        purchases={purchases}
        expenses={expenses}
        onRestoreData={handleRestoreData}
        onResetDemoData={handleResetDemoData}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
