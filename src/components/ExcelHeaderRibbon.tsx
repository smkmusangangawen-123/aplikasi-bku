import React from 'react';
import { AppSettings, ActiveTab, BkuTransaction } from '../types';
import { exportToExcelFile } from '../utils/excelExport';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Laptop,
  School,
} from 'lucide-react';

interface ExcelHeaderRibbonProps {
  settings: AppSettings;
  transactions: BkuTransaction[];
  activeTab: ActiveTab;
  onOpenImport: () => void;
  onOpenInstall: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const ExcelHeaderRibbon: React.FC<ExcelHeaderRibbonProps> = ({
  settings,
  transactions,
  activeTab,
  onOpenImport,
  onOpenInstall,
  onNavigate,
}) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="bg-[#107C41] text-white select-none print:hidden shadow-sm">
      {/* Upper Green Ribbon */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & School Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-white/15 flex items-center justify-center border border-white/20">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base tracking-wide uppercase">
                Aplikasi BKU & Kwitansi Sekolah
              </span>
              <span className="text-[10px] bg-white/20 text-white font-bold px-1.5 py-0.5 rounded">
                T.A. {settings.tahunAnggaran}
              </span>
              {/* Offline Ready indicator */}
              <div
                className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isOnline
                    ? 'bg-emerald-950/40 text-emerald-200 border-emerald-400/30'
                    : 'bg-amber-950/60 text-amber-200 border-amber-400/40'
                }`}
                title={
                  isOnline
                    ? 'Aplikasi telah di-cache dan siap digunakan tanpa koneksi internet (Offline Ready)'
                    : 'Aplikasi berjalan dalam mode offline tanpa internet. Data tersimpan di laptop Anda.'
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{isOnline ? 'Offline Ready' : 'Mode Offline'}</span>
              </div>
            </div>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
              <School className="w-3 h-3 inline" />
              {settings.namaSekolah} &bull; {settings.pemerintahan}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenInstall}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm transition active:scale-95"
            title="Cara pasang aplikasi ini langsung di laptop / komputer"
          >
            <Laptop className="w-3.5 h-3.5 text-slate-900" />
            <span>Pasang di Laptop</span>
          </button>

          <button
            onClick={() => exportToExcelFile(settings, transactions)}
            className="bg-emerald-800 hover:bg-emerald-900 border border-emerald-500/40 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-xs transition"
            title="Unduh seluruh data dalam format Microsoft Excel / Google Sheets (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unduh</span> Excel (.xlsx)
          </button>

          <button
            onClick={onOpenImport}
            className="bg-emerald-800 hover:bg-emerald-900 border border-emerald-500/40 text-white font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition"
            title="Unggah dan impor file Excel"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Impor</span> Excel
          </button>

          {(activeTab === 'A2' || activeTab === 'KWITANSI') && (
            <button
              onClick={() => window.print()}
              className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              Cetak Dokumen
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
