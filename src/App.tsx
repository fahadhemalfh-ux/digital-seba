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
import { ExpenseRecord, PurchaseRecord, SaleRecord, ShopProfile } from './types';
import { defaultShopProfile, getInitialData } from './data/initialData';

export default function App() {
  // 1. Shop Profile
  const [shopProfile, setShopProfile] = useState<ShopProfile>(() => {
    try {
      const saved = localStorage.getItem('dokankhata_shop_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If old placeholder or contains 'লাইব্রেরী', upgrade to user's real business profile
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

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal States
  const [isDigitalMemoOpen, setIsDigitalMemoOpen] = useState(false);
  const [selectedMemoSale, setSelectedMemoSale] = useState<SaleRecord | null>(null);
  const [isBlankMemoOpen, setIsBlankMemoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    setShopProfile(defaultShopProfile);
  };

  // Clear All Records
  const handleClearAllData = () => {
    setSales([]);
    setPurchases([]);
    setExpenses([]);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation & Brand Header */}
      <Header
        shopProfile={shopProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickSale={() => setActiveTab('sales')}
        onOpenQuickPurchase={() => setActiveTab('purchases')}
        onOpenQuickExpense={() => setActiveTab('expenses')}
        onOpenDigitalMemo={() => handleOpenDigitalMemo()}
        onOpenBlankMemo={() => setIsBlankMemoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            sales={sales}
            purchases={purchases}
            expenses={expenses}
            shopProfile={shopProfile}
            onOpenQuickSale={() => setActiveTab('sales')}
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
