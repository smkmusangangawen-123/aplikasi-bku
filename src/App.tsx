import React, { useState, useEffect } from 'react';
import { AppSettings, BkuTransaction, ActiveTab } from './types';
import { initialSettings, sampleTransactions } from './data/initialData';
import { ExcelHeaderRibbon } from './components/ExcelHeaderRibbon';
import { ExcelSheetTabs } from './components/ExcelSheetTabs';
import { HomeView } from './components/HomeView';
import { BkuTableView } from './components/BkuTableView';
import { A2View } from './components/A2View';
import { KwitansiView } from './components/KwitansiView';
import { AnalysisView } from './components/AnalysisView';
import { TransactionModal } from './components/TransactionModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { InstallAppModal } from './components/InstallAppModal';

const STORAGE_KEY_SETTINGS = 'bku_app_settings_v1';
const STORAGE_KEY_TRANSACTIONS = 'bku_app_transactions_v1';

export default function App() {
  // 1. Settings state with localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  // 2. Transactions state with localStorage
  const [transactions, setTransactions] = useState<BkuTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      return saved ? JSON.parse(saved) : sampleTransactions;
    } catch {
      return sampleTransactions;
    }
  });

  // 3. Navigation & Modal state
  const [activeTab, setActiveTab] = useState<ActiveTab>('HOME');
  const [selectedTxId, setSelectedTxId] = useState<string | undefined>(undefined);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<BkuTransaction | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  // Handler: Add or update transaction
  const handleSaveTransaction = (tx: BkuTransaction) => {
    if (editingTx) {
      setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
    } else {
      setTransactions((prev) => [...prev, tx]);
    }
    setEditingTx(null);
  };

  // Handler: Delete single transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Handler: Delete multiple selected transactions
  const handleDeleteMultipleTransactions = (ids: string[]) => {
    setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));
  };

  // Handler: Clear all transactions
  const handleClearAllTransactions = () => {
    setTransactions([]);
  };

  // Handler: Open modal for new transaction
  const handleAddNewTransaction = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  // Handler: Open modal for editing
  const handleEditTransaction = (tx: BkuTransaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  // Handler: Navigate to A2 or Kwitansi with specific transaction selected
  const handleSelectTransactionForDoc = (tx: BkuTransaction, targetTab: 'A2' | 'KWITANSI') => {
    setSelectedTxId(tx.id);
    setActiveTab(targetTab);
  };

  // Handler: Reset to default sample data
  const handleResetToDefault = () => {
    setTransactions(sampleTransactions);
    setSettings(initialSettings);
  };

  // Handler: Import success from Excel with mode
  const handleImportSuccess = (importedData: BkuTransaction[], mode: 'replace' | 'append') => {
    if (mode === 'append') {
      const maxNo = transactions.length > 0 ? Math.max(...transactions.map((t) => t.no || 0)) : 0;
      const renumbered = importedData.map((t, idx) => ({
        ...t,
        id: `bku-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        no: maxNo + idx + 1,
      }));
      setTransactions((prev) => [...prev, ...renumbered]);
    } else {
      setTransactions(importedData);
    }
    setActiveTab('INPUT BKU');
  };

  // Next transaction number
  const nextNo = transactions.length > 0 ? Math.max(...transactions.map((t) => t.no || 0)) + 1 : 1;

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-900 flex flex-col font-sans pb-16">
      {/* Top Excel Ribbon Bar */}
      <ExcelHeaderRibbon
        settings={settings}
        transactions={transactions}
        activeTab={activeTab}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        onNavigate={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6">
        {activeTab === 'HOME' && (
          <HomeView
            settings={settings}
            onUpdateSettings={setSettings}
            onNavigate={setActiveTab}
            transactions={transactions}
            onOpenFileImport={() => setIsImportModalOpen(true)}
            onOpenInstall={() => setIsInstallModalOpen(true)}
          />
        )}

        {activeTab === 'INPUT BKU' && (
          <BkuTableView
            settings={settings}
            transactions={transactions}
            onAddTransaction={handleAddNewTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteMultipleTransactions={handleDeleteMultipleTransactions}
            onClearAllTransactions={handleClearAllTransactions}
            onOpenImport={() => setIsImportModalOpen(true)}
            onNavigate={setActiveTab}
            onSelectTransactionForDoc={handleSelectTransactionForDoc}
            onResetToDefault={handleResetToDefault}
          />
        )}

        {activeTab === 'A2' && (
          <A2View
            settings={settings}
            transactions={transactions}
            selectedTxId={selectedTxId}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'KWITANSI' && (
          <KwitansiView
            settings={settings}
            transactions={transactions}
            selectedTxId={selectedTxId}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'ANALISIS' && (
          <AnalysisView
            settings={settings}
            transactions={transactions}
            onNavigate={setActiveTab}
          />
        )}
      </main>

      {/* Bottom Excel Sheet Tabs Navigator */}
      <ExcelSheetTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onAddNewTransaction={handleAddNewTransaction}
      />

      {/* Modal Add / Edit Transaction */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={editingTx}
        nextNo={nextNo}
      />

      {/* Modal Excel Import */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        settings={settings}
        currentTransactions={transactions}
      />

      {/* Modal Install App */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
