import React from 'react';
import { AppSettings, ActiveTab, BkuTransaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { exportToExcelFile } from '../utils/excelExport';
import {
  FileSpreadsheet,
  Receipt,
  FileText,
  PieChart,
  Download,
  Upload,
  CheckCircle2,
  Building2,
  Calendar,
  UserCheck,
  Award,
  Laptop,
} from 'lucide-react';

interface HomeViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onNavigate: (tab: ActiveTab) => void;
  transactions: BkuTransaction[];
  onOpenFileImport: () => void;
  onOpenInstall: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
  transactions,
  onOpenFileImport,
  onOpenInstall,
}) => {
  const [savedAlert, setSavedAlert] = React.useState(false);

  const totalPenerimaan = transactions.reduce((acc, t) => acc + (Number(t.penerimaan) || 0), 0);
  const totalPengeluaran = transactions.reduce((acc, t) => acc + (Number(t.pengeluaran) || 0), 0);
  const sisaSaldo = totalPenerimaan - totalPengeluaran;
  const totalBpu = transactions.filter((t) => (t.bkuNo || '').trim() !== '').length;

  const handleChange = (field: keyof AppSettings, value: string) => {
    onUpdateSettings({
      ...settings,
      [field]: value,
    });
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner (Faithful to Excel Image 1) */}
      <div className="bg-[#41B6E6] border-2 border-[#1A82AA] rounded-md py-4 px-6 text-center shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-black uppercase font-serif">
          APLIKASI BKU & KWITANSI SEKOLAH
        </h1>
        <p className="text-xs sm:text-sm text-slate-900 font-medium mt-1">
          Buku Kas Umum (BKU), Format Bukti Kas Model A2, Cetak Kwitansi & Integrasi Excel/Google Sheets
        </p>
      </div>

      {/* Main Grid: Form Left, Big Action Buttons Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Profile & Parameters (8 cols) */}
        <div className="lg:col-span-8 bg-[#87CEEB]/20 border-2 border-[#41B6E6] rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#41B6E6]/40 pb-3">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#006699]" />
              Identitas Satuan Pendidikan & Anggaran
            </h2>
            {savedAlert && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan Otomatis
              </span>
            )}
          </div>

          <div className="space-y-3.5 text-sm">
            {/* Pemerintahan */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <label
                htmlFor="pemerintahan-input"
                className="sm:col-span-4 font-bold text-red-700 uppercase text-xs sm:text-sm border border-red-500 bg-red-50/50 px-2.5 py-1.5 rounded"
              >
                Nama Pemerintahan
              </label>
              <div className="sm:col-span-1 text-center hidden sm:block font-bold">:</div>
              <div className="sm:col-span-7">
                <input
                  id="pemerintahan-input"
                  type="text"
                  value={settings.pemerintahan}
                  onChange={(e) => handleChange('pemerintahan', e.target.value)}
                  placeholder="BLORA"
                  className="w-full font-bold uppercase bg-white text-slate-900 border-2 border-red-500 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* Tahun Anggaran */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <label
                htmlFor="tahun-anggaran-select"
                className="sm:col-span-4 font-bold text-red-700 uppercase text-xs sm:text-sm border border-red-500 bg-red-50/50 px-2.5 py-1.5 rounded"
              >
                Tahun Anggaran
              </label>
              <div className="sm:col-span-1 text-center hidden sm:block font-bold">:</div>
              <div className="sm:col-span-7">
                <select
                  id="tahun-anggaran-select"
                  value={settings.tahunAnggaran}
                  onChange={(e) => handleChange('tahunAnggaran', e.target.value)}
                  className="w-full font-bold bg-white text-slate-900 border-2 border-emerald-600 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            {/* Nama Sekolah */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <label
                htmlFor="nama-sekolah-input"
                className="sm:col-span-4 font-bold text-red-700 uppercase text-xs sm:text-sm border border-red-500 bg-red-50/50 px-2.5 py-1.5 rounded"
              >
                Nama Sekolah
              </label>
              <div className="sm:col-span-1 text-center hidden sm:block font-bold">:</div>
              <div className="sm:col-span-7">
                <input
                  id="nama-sekolah-input"
                  type="text"
                  value={settings.namaSekolah}
                  onChange={(e) => handleChange('namaSekolah', e.target.value)}
                  placeholder="SMK MUHAMMADIYAH NGAWEN"
                  className="w-full font-bold uppercase bg-white text-slate-900 border-2 border-red-500 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* Kecamatan */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <label
                htmlFor="kecamatan-input"
                className="sm:col-span-4 font-bold text-red-700 uppercase text-xs sm:text-sm border border-red-500 bg-red-50/50 px-2.5 py-1.5 rounded"
              >
                Kecamatan / Kota
              </label>
              <div className="sm:col-span-1 text-center hidden sm:block font-bold">:</div>
              <div className="sm:col-span-7">
                <input
                  id="kecamatan-input"
                  type="text"
                  value={settings.kecamatan}
                  onChange={(e) => handleChange('kecamatan', e.target.value)}
                  placeholder="Ngawen"
                  className="w-full bg-white text-slate-900 border-2 border-red-500 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* Nama Kepala Sekolah */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <label
                htmlFor="kepala-sekolah-input"
                className="sm:col-span-4 font-bold text-red-700 uppercase text-xs sm:text-sm border border-red-500 bg-red-50/50 px-2.5 py-1.5 rounded"
              >
                Nama Kepala Sekolah
              </label>
              <div className="sm:col-span-1 text-center hidden sm:block font-bold">:</div>
              <div className="sm:col-span-7">
                <input
                  id="kepala-sekolah-input"
                  type="text"
                  value={settings.namaKepalaSekolah}
                  onChange={(e) => handleChange('namaKepalaSekolah', e.target.value)}
                  placeholder="Sri Widayanti,S.Pd,Si"
                  className="w-full font-semibold bg-white text-slate-900 border-2 border-red-500 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* NIP Kepala Sekolah */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <label
                htmlFor="nip-kepala-input"
                className="sm:col-span-4 font-bold text-red-700 uppercase text-xs sm:text-sm border border-red-500 bg-red-50/50 px-2.5 py-1.5 rounded"
              >
                NIP Kepala Sekolah
              </label>
              <div className="sm:col-span-1 text-center hidden sm:block font-bold">:</div>
              <div className="sm:col-span-7">
                <input
                  id="nip-kepala-input"
                  type="text"
                  value={settings.nipKepalaSekolah}
                  onChange={(e) => handleChange('nipKepalaSekolah', e.target.value)}
                  placeholder="-"
                  className="w-full bg-white text-slate-900 border-2 border-red-500 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* Nama Bendahara */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <label
                htmlFor="bendahara-input"
                className="sm:col-span-4 font-bold text-red-700 uppercase text-xs sm:text-sm border border-red-500 bg-red-50/50 px-2.5 py-1.5 rounded"
              >
                Nama Bendahara BOS
              </label>
              <div className="sm:col-span-1 text-center hidden sm:block font-bold">:</div>
              <div className="sm:col-span-7">
                <input
                  id="bendahara-input"
                  type="text"
                  value={settings.namaBendahara}
                  onChange={(e) => handleChange('namaBendahara', e.target.value)}
                  placeholder="Lilieh Purwasekti, S.Pd.I"
                  className="w-full font-semibold bg-white text-slate-900 border-2 border-red-500 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* NIP Bendahara */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <label
                htmlFor="nip-bendahara-input"
                className="sm:col-span-4 font-bold text-red-700 uppercase text-xs sm:text-sm border border-red-500 bg-red-50/50 px-2.5 py-1.5 rounded"
              >
                NIP Bendahara
              </label>
              <div className="sm:col-span-1 text-center hidden sm:block font-bold">:</div>
              <div className="sm:col-span-7">
                <input
                  id="nip-bendahara-input"
                  type="text"
                  value={settings.nipBendahara}
                  onChange={(e) => handleChange('nipBendahara', e.target.value)}
                  placeholder="-"
                  className="w-full bg-white text-slate-900 border-2 border-red-500 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>

            {/* Sub Unit Organisasi */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <label
                htmlFor="subunit-input"
                className="sm:col-span-4 font-bold text-slate-700 uppercase text-xs sm:text-sm border border-slate-400 bg-slate-100 px-2.5 py-1.5 rounded"
              >
                Sub Unit Organisasi
              </label>
              <div className="sm:col-span-1 text-center hidden sm:block font-bold">:</div>
              <div className="sm:col-span-7">
                <input
                  id="subunit-input"
                  type="text"
                  value={settings.subUnitOrganisasi || ''}
                  onChange={(e) => handleChange('subUnitOrganisasi', e.target.value)}
                  placeholder="Cabang Dinas Pendidikan Wilayah IV"
                  className="w-full bg-white text-slate-900 border-2 border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Menu Buttons (Faithful to Excel Image 1 Menu Buttons) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center pb-1 border-b">
              Menu Navigasi Cepat
            </h3>

            {/* Red Button: ANALISIS & REKAP */}
            <button
              id="menu-nav-analisis"
              onClick={() => onNavigate('ANALISIS')}
              className="w-full bg-[#E50914] hover:bg-[#C10710] text-white font-serif font-black text-2xl py-4 rounded-md shadow transition-transform active:scale-95 flex items-center justify-center gap-2 tracking-widest uppercase border-2 border-red-800"
            >
              <PieChart className="w-6 h-6" />
              MENU
            </button>

            {/* Green Button: BKU */}
            <button
              id="menu-nav-bku"
              onClick={() => onNavigate('INPUT BKU')}
              className="w-full bg-[#70AD47] hover:bg-[#5E9439] text-black font-serif font-black text-3xl py-5 rounded-md shadow transition-transform active:scale-95 flex items-center justify-center gap-2 tracking-widest uppercase border-2 border-[#4A792A]"
            >
              <FileSpreadsheet className="w-8 h-8" />
              BKU
            </button>

            {/* Purple Button: A2 */}
            <button
              id="menu-nav-a2"
              onClick={() => onNavigate('A2')}
              className="w-full bg-[#4F446D] hover:bg-[#3D3357] text-white font-serif font-black text-3xl py-5 rounded-md shadow transition-transform active:scale-95 flex items-center justify-center gap-2 tracking-widest uppercase border-2 border-[#2A233F]"
            >
              <FileText className="w-8 h-8" />
              A2
            </button>

            {/* Blue Button: KWITANSI */}
            <button
              id="menu-nav-kwitansi"
              onClick={() => onNavigate('KWITANSI')}
              className="w-full bg-[#1B75BC] hover:bg-[#135A94] text-white font-serif font-black text-2xl py-4 rounded-md shadow transition-transform active:scale-95 flex items-center justify-center gap-2 tracking-wider uppercase border-2 border-[#0D4472]"
            >
              <Receipt className="w-7 h-7" />
              KWITANSI
            </button>
          </div>

          {/* Quick Excel / Google Sheets Actions */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
              Format Excel & Google Sheets
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Data dapat diunduh langsung dalam format <strong>.xlsx</strong> multi-sheet (HOME, INPUT BKU, A2, KWITANSI, REKAP) atau dibuka di Google Sheets.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                id="btn-quick-export-excel"
                onClick={() => exportToExcelFile(settings, transactions)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                Unduh File Excel (.xlsx)
              </button>
              <button
                id="btn-quick-import-excel"
                onClick={onOpenFileImport}
                className="w-full bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-400 text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                Impor dari File Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* Install on Laptop Card */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Laptop className="w-5 h-5 text-amber-700" />
              Pasang Aplikasi di Laptop
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Ingin membukukan kas tanpa repot membuka browser? Pasang aplikasi ini ke Desktop laptop Anda seperti program software biasa.
            </p>
            <button
              id="btn-quick-install-pwa"
              onClick={onOpenInstall}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs py-2.5 px-3 rounded flex items-center justify-center gap-2 shadow-sm transition active:scale-95 uppercase tracking-wide"
            >
              <Laptop className="w-4 h-4" />
              Petunjuk Pasang di Laptop
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Penerimaan
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-700 block mt-1">
            {formatRupiah(totalPenerimaan)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Kas Masuk / Dana BOS</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Pengeluaran
          </span>
          <span className="text-lg sm:text-xl font-black text-red-600 block mt-1">
            {formatRupiah(totalPengeluaran)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Realisasi Belanja</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Sisa Saldo Kas
          </span>
          <span
            className={`text-lg sm:text-xl font-black block mt-1 ${
              sisaSaldo >= 0 ? 'text-blue-700' : 'text-rose-700'
            }`}
          >
            {formatRupiah(sisaSaldo)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Posisi Kas Berjalan</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Jumlah BPU / Bukti
          </span>
          <span className="text-lg sm:text-xl font-black text-indigo-700 block mt-1">
            {totalBpu} Transaksi
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Nomor Kwitansi BPU Aktif</span>
        </div>
      </div>
    </div>
  );
};
