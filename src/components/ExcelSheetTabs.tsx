import React from 'react';
import { ActiveTab } from '../types';
import {
  Home,
  TableProperties,
  FileText,
  Receipt,
  PieChart,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ExcelSheetTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onAddNewTransaction: () => void;
}

export const ExcelSheetTabs: React.FC<ExcelSheetTabsProps> = ({
  activeTab,
  onSelectTab,
  onAddNewTransaction,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; color?: string }[] = [
    { id: 'HOME', label: 'HOME', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'INPUT BKU', label: 'INPUT BKU', icon: <TableProperties className="w-3.5 h-3.5" />, color: 'emerald' },
    { id: 'A2', label: 'A2', icon: <FileText className="w-3.5 h-3.5" />, color: 'purple' },
    { id: 'KWITANSI', label: 'KWITANSI', icon: <Receipt className="w-3.5 h-3.5" />, color: 'blue' },
    { id: 'ANALISIS', label: 'ANALISIS & REKAP', icon: <PieChart className="w-3.5 h-3.5" />, color: 'red' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#F3F2F1] border-t border-[#D2D0CE] flex items-center px-2 py-1 shadow-md select-none print:hidden">
      {/* Excel Sheet Navigator Arrows */}
      <div className="flex items-center text-slate-500 border-r border-slate-300 pr-1 mr-1 gap-0.5">
        <button
          onClick={() => {
            const idx = tabs.findIndex((t) => t.id === activeTab);
            if (idx > 0) onSelectTab(tabs[idx - 1].id);
          }}
          className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30"
          title="Lembar Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const idx = tabs.findIndex((t) => t.id === activeTab);
            if (idx < tabs.length - 1) onSelectTab(tabs[idx + 1].id);
          }}
          className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30"
          title="Lembar Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Container */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`sheet-tab-${tab.id.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap rounded-t-sm border-t-2 ${
                isActive
                  ? 'bg-white text-emerald-800 border-t-emerald-600 shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200/80 border-t-transparent'
              }`}
            >
              {tab.icon}
              <span className="tracking-wide">{tab.label}</span>
            </button>
          );
        })}

        {/* Plus (+) Button to Add Transaction Row like Excel */}
        <button
          id="btn-tab-plus"
          onClick={onAddNewTransaction}
          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-200 rounded-full transition"
          title="Tambah Transaksi Baru"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right Indicator */}
      <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 font-medium pl-3 border-l border-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Format Excel / Google Sheets
        </span>
      </div>
    </div>
  );
};
