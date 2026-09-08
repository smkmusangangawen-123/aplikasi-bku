import React, { useState, useMemo } from 'react';
import { BkuTransaction, AppSettings, ActiveTab } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  exportToExcelFile,
  exportBkuTemplateExcel,
  calculateTransactionsWithSaldo,
} from '../utils/excelExport';
import {
  ArrowLeft,
  Plus,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  Edit2,
  Trash2,
  Receipt,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Upload,
  AlertTriangle,
  X,
  FileDown,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface BkuTableViewProps {
  settings: AppSettings;
  transactions: BkuTransaction[];
  onAddTransaction: () => void;
  onEditTransaction: (tx: BkuTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDeleteMultipleTransactions?: (ids: string[]) => void;
  onClearAllTransactions?: () => void;
  onOpenImport?: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onSelectTransactionForDoc: (tx: BkuTransaction, targetTab: 'A2' | 'KWITANSI') => void;
  onResetToDefault: () => void;
}

export const BkuTableView: React.FC<BkuTableViewProps> = ({
  settings,
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteMultipleTransactions,
  onClearAllTransactions,
  onOpenImport,
  onNavigate,
  onSelectTransactionForDoc,
  onResetToDefault,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('ALL');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  // Confirmation Modals State
  const [txToDelete, setTxToDelete] = useState<BkuTransaction | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Compute calculated balance
  const transactionsWithSaldo = useMemo(() => {
    return calculateTransactionsWithSaldo(transactions);
  }, [transactions]);

  // Filter list
  const filteredList = useMemo(() => {
    return transactionsWithSaldo.filter((tx) => {
      const matchSearch =
        searchQuery === '' ||
        tx.uraian.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.penerima || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.bkuNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.kodeRekening || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.tanggal.includes(searchQuery);

      const matchProgram =
        filterProgram === 'ALL' ||
        tx.program.includes(filterProgram) ||
        (filterProgram === 'EMPTY' && !tx.program);

      return matchSearch && matchProgram;
    });
  }, [transactionsWithSaldo, searchQuery, filterProgram]);

  // Checkbox Selection Handlers
  const allFilteredSelected =
    filteredList.length > 0 &&
    filteredList.every((tx) => selectedTxIds.includes(tx.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      // Unselect all in current filter
      const filteredIds = new Set(filteredList.map((t) => t.id));
      setSelectedTxIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      // Select all in current filter
      const newIds = new Set([...selectedTxIds, ...filteredList.map((t) => t.id)]);
      setSelectedTxIds(Array.from(newIds));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculations for totals
  const totalPenerimaan = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.penerimaan) || 0), 0),
    [transactions]
  );
  const totalPengeluaran = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.pengeluaran) || 0), 0),
    [transactions]
  );
  const sisaSaldo = totalPenerimaan - totalPengeluaran;
  const totalPpn = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.ppn) || 0), 0),
    [transactions]
  );
  const totalPph21 = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.pph21) || 0), 0),
    [transactions]
  );
  const totalPph23 = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.pph23) || 0), 0),
    [transactions]
  );

  // Copy table TSV for direct paste into Google Sheets or Excel
  const copyForGoogleSheets = () => {
    const headers = [
      'NO',
      'TANGGAL',
      'PROGRAM',
      'PROG',
      'KEGIATAN',
      'KODE REKENING',
      'BKU',
      'URAIAN',
      'PENERIMAAN',
      'PENGELUARAN',
      'SALDO',
      'PENERIMA',
      'PPN',
      'PPH21',
      'PPH23',
      'BARANG PERSEDIAAN',
    ].join('\t');

    const rows = transactionsWithSaldo
      .map((t, idx) =>
        [
          t.no || idx + 1,
          t.tanggal,
          t.program,
          t.prog,
          t.kegiatan,
          t.kodeRekening,
          t.bkuNo,
          t.uraian,
          t.penerimaan,
          t.pengeluaran,
          t.saldo,
          t.penerima,
          t.ppn,
          t.pph21,
          t.pph23,
          t.barangPersediaan,
        ].join('\t')
      )
      .join('\n');

    const fullTsv = `${headers}\n${rows}`;
    navigator.clipboard.writeText(fullTsv);
    setCopySuccess(true);
    showToast('Tabel BKU berhasil disalin! Silakan tempel (Ctrl+V) di Excel atau Google Sheets.');
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Execution: Single Delete
  const handleConfirmSingleDelete = () => {
    if (!txToDelete) return;
    const deletedNo = txToDelete.no || txToDelete.bkuNo || 'terpilih';
    onDeleteTransaction(txToDelete.id);
    setSelectedTxIds((prev) => prev.filter((id) => id !== txToDelete.id));
    setTxToDelete(null);
    showToast(`Baris transaksi No. ${deletedNo} berhasil dihapus.`);
  };

  // Execution: Batch Delete
  const handleConfirmBatchDelete = () => {
    if (selectedTxIds.length === 0) return;
    const count = selectedTxIds.length;
    if (onDeleteMultipleTransactions) {
      onDeleteMultipleTransactions(selectedTxIds);
    } else {
      selectedTxIds.forEach((id) => onDeleteTransaction(id));
    }
    setSelectedTxIds([]);
    setIsBatchDeleteModalOpen(false);
    showToast(`${count} baris transaksi berhasil dihapus.`);
  };

  // Execution: Clear All
  const handleConfirmClearAll = () => {
    if (onClearAllTransactions) {
      onClearAllTransactions();
    } else {
      transactions.forEach((t) => onDeleteTransaction(t.id));
    }
    setSelectedTxIds([]);
    setIsClearAllModalOpen(false);
    showToast('Seluruh data transaksi BKU berhasil dikosongkan.');
  };

  // Execution: Reset Sample
  const handleConfirmReset = () => {
    onResetToDefault();
    setSelectedTxIds([]);
    setIsResetModalOpen(false);
    showToast('Data transaksi telah dimuat ulang dari data sampel.');
  };

  // Download official BKU template
  const handleDownloadTemplate = () => {
    exportBkuTemplateExcel();
    showToast('Template Excel BKU (.xlsx) berhasil diunduh. Silakan isi dan unggah kembali.');
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Yellow BACK button */}
            <button
              id="bku-back-button"
              onClick={() => onNavigate('HOME')}
              className="bg-[#C58210] hover:bg-[#A86B07] text-white px-4 py-1.5 rounded-md font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                BUKU KAS UMUM (INPUT BKU)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {settings.namaSekolah} &bull; T.A. {settings.tahunAnggaran} &bull;{' '}
                <strong className="text-slate-700">{transactions.length}</strong> Baris Transaksi
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Tambah Transaksi */}
            <button
              id="bku-add-button"
              onClick={onAddTransaction}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-md shadow-sm flex items-center gap-1.5 transition active:scale-95"
              title="Tambah baris transaksi kas baru secara manual"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Transaksi</span>
            </button>

            {/* 2. Upload Template Excel (Requested by User) */}
            <button
              id="bku-upload-excel-btn"
              onClick={onOpenImport}
              className="bg-[#107C41] hover:bg-[#0B5C30] text-white text-xs font-bold px-3 py-2 rounded-md shadow-sm flex items-center gap-1.5 transition active:scale-95 ring-2 ring-emerald-500/20"
              title="Unggah template file Excel (.xlsx) langsung ke Buku Kas Umum"
            >
              <Upload className="w-4 h-4 text-emerald-200" />
              <span>Upload Template Excel</span>
            </button>

            {/* 3. Unduh Template Excel Kosong */}
            <button
              id="bku-download-template-btn"
              onClick={handleDownloadTemplate}
              className="bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold px-3 py-2 rounded-md shadow-sm flex items-center gap-1.5 transition"
              title="Unduh format template Excel resmi dengan 16 kolom BKU dan contoh pengisian"
            >
              <FileDown className="w-4 h-4 text-sky-200" />
              <span className="hidden sm:inline">Unduh</span> Template (.xlsx)
            </button>

            {/* 4. Unduh Excel BKU Lengkap */}
            <button
              id="bku-export-excel-btn"
              onClick={() => exportToExcelFile(settings, transactions)}
              className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-sm flex items-center gap-1.5 transition"
              title="Unduh seluruh data BKU beserta rekap analisis dan kwitansi"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span className="hidden md:inline">Unduh BKU</span> (.xlsx)
            </button>

            {/* 5. Salin ke Google Sheets */}
            <button
              id="bku-copy-sheets-btn"
              onClick={copyForGoogleSheets}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold px-2.5 py-2 rounded-md flex items-center gap-1.5 transition"
              title="Salin tabel untuk ditempel langsung ke Google Sheets atau Excel"
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold hidden sm:inline">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Salin Sheets</span>
                </>
              )}
            </button>

            {/* 6. More Options: Reset / Kosongkan */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="text-slate-500 hover:text-slate-800 p-2 rounded hover:bg-slate-100 transition"
                title="Muat Ulang Data Sampel BKU Awal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {transactions.length > 0 && (
                <button
                  onClick={() => setIsClearAllModalOpen(true)}
                  className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition"
                  title="Kosongkan Semua Data Transaksi BKU"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor BKU, uraian, penerima, atau rekening..."
                className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 font-bold shrink-0"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 font-medium">Filter Program:</span>
              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold text-slate-800"
              >
                <option value="ALL">Semua Program ({transactions.length})</option>
                <option value="02.">02. Standar Isi/Proses</option>
                <option value="03.">03. Pengembangan Standar Proses</option>
                <option value="06.">06. Sarana & Prasarana</option>
                <option value="07.">07. Standar Pengelolaan / Honor</option>
                <option value="EMPTY">Saldo / Tarik Tunai Awal</option>
              </select>
            </div>

            <span className="text-[11px] text-slate-400 hidden lg:inline">
              Tip: Klik dua kali pada baris untuk mengedit data
            </span>
          </div>
        </div>

        {/* Batch Selection Action Bar (Appears when rows are selected) */}
        {selectedTxIds.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-amber-900">
                {selectedTxIds.length} baris transaksi dipilih
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedTxIds.length === 1 && (
                <button
                  onClick={() => {
                    const target = transactions.find((t) => t.id === selectedTxIds[0]);
                    if (target) onEditTransaction(target);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-xs transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Transaksi Ini
                </button>
              )}
              <button
                onClick={() => setIsBatchDeleteModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus {selectedTxIds.length} Transaksi Terpilih
              </button>
              <button
                onClick={() => setSelectedTxIds([])}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded font-medium transition"
              >
                Batal Pilih
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spreadsheet Table Container (Faithful to Excel Image 2) */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[68vh]">
          <table className="w-full text-[11px] border-collapse min-w-[1450px]">
            {/* Row 1 Headers (Bright Yellow background like Image 2) */}
            <thead className="sticky top-0 z-20 shadow-sm">
              <tr className="bg-[#FFFF00] text-black font-extrabold uppercase border-b border-black text-center select-none">
                {/* Select All Checkbox Column */}
                <th className="border border-black px-2 py-2 w-10 text-center bg-[#F5F500]">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={handleToggleSelectAll}
                    title="Pilih / Batalkan semua baris yang tampil"
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="border border-black px-2 py-2 w-10">NO</th>
                <th className="border border-black px-2 py-2 w-24">TANGGAL</th>
                <th className="border border-black px-1 py-2 w-12">PROGRAM</th>
                <th className="border border-black px-1 py-2 w-14">PROG</th>
                <th className="border border-black px-1 py-2 w-16">KEGIATAN</th>
                <th className="border border-black px-3 py-2 w-80 text-left">KODE REKENING</th>
                <th className="border border-black px-2 py-2 w-16">BKU</th>
                <th className="border border-black px-3 py-2 text-left min-w-[220px]">URAIAN</th>
                <th className="border border-black px-2 py-2 w-28 text-right">PENERIMAAN</th>
                <th className="border border-black px-2 py-2 w-28 text-right">PENGELUARAN</th>
                <th className="border border-black px-2 py-2 w-28 text-right bg-[#FFF480]">SALDO</th>
                <th className="border border-black px-3 py-2 text-left w-36">PENERIMA</th>
                <th className="border border-black px-1 py-2 w-14 text-right">PPN</th>
                <th className="border border-black px-1 py-2 w-14 text-right">PPH21</th>
                <th className="border border-black px-1 py-2 w-14 text-right">PPH23</th>
                <th className="border border-black px-1 py-2 w-20">BARANG PERSEDIAAN</th>
                <th className="border border-black px-2 py-2 w-48 bg-[#FFF2B2] text-center font-black">
                  AKSI & KELOLA
                </th>
              </tr>
              {/* Row 2 Numbers (1, 2, 3, 4 ... like in Image 2) */}
              <tr className="bg-[#FFFF77] text-black font-bold text-center border-b border-black text-[10px]">
                <td className="border border-black py-0.5">✓</td>
                <td className="border border-black py-0.5">1</td>
                <td className="border border-black py-0.5">2</td>
                <td className="border border-black py-0.5">3</td>
                <td className="border border-black py-0.5">4</td>
                <td className="border border-black py-0.5">5</td>
                <td className="border border-black py-0.5 text-left pl-2">6</td>
                <td className="border border-black py-0.5">7</td>
                <td className="border border-black py-0.5 text-left pl-2">8</td>
                <td className="border border-black py-0.5 text-right pr-2">9</td>
                <td className="border border-black py-0.5 text-right pr-2">10</td>
                <td className="border border-black py-0.5 text-right pr-2">11</td>
                <td className="border border-black py-0.5 text-left pl-2">12</td>
                <td className="border border-black py-0.5">13</td>
                <td className="border border-black py-0.5">14</td>
                <td className="border border-black py-0.5">15</td>
                <td className="border border-black py-0.5">16</td>
                <td className="border border-black py-0.5 bg-[#FFF2B2] text-amber-950 font-black">
                  EDIT / HAPUS / CETAK
                </td>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={18} className="text-center py-12 px-4 text-slate-500 font-sans">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">
                        {transactions.length === 0
                          ? 'Belum ada transaksi di Buku Kas Umum'
                          : 'Tidak ada transaksi yang cocok dengan pencarian / filter'}
                      </p>
                      <p className="text-xs text-slate-500 text-center">
                        {transactions.length === 0
                          ? 'Anda dapat mengunggah file template Excel (.xlsx), mengunduh format template, atau menambah data transaksi baru secara manual.'
                          : 'Coba ubah kata kunci pencarian atau ganti filter program di atas.'}
                      </p>
                      {transactions.length === 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            onClick={onOpenImport}
                            className="bg-[#107C41] hover:bg-[#0B5C30] text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Template Excel
                          </button>
                          <button
                            onClick={handleDownloadTemplate}
                            className="bg-sky-700 hover:bg-sky-800 text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            Unduh Template
                          </button>
                          <button
                            onClick={onAddTransaction}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Tambah Transaksi
                          </button>
                          <button
                            onClick={() => setIsResetModalOpen(true)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-medium"
                          >
                            Muat Data Sampel
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((tx, idx) => {
                  const isPengeluaran = (tx.pengeluaran || 0) > 0;
                  const isSelected = selectedTxIds.includes(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      onDoubleClick={() => onEditTransaction(tx)}
                      className={`hover:bg-amber-50/50 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100/60 font-semibold'
                          : idx % 2 === 1
                          ? 'bg-[#FAFAFA]'
                          : 'bg-white'
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="border border-slate-300 text-center px-1.5 py-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(tx.id)}
                          className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* 1. NO */}
                      <td className="border border-slate-300 text-center font-bold px-1.5 py-1.5 text-slate-700">
                        {tx.no || idx + 1}
                      </td>

                      {/* 2. TANGGAL */}
                      <td className="border border-slate-300 text-center px-1.5 py-1.5 text-slate-800 whitespace-nowrap">
                        {tx.tanggal}
                      </td>

                      {/* 3. PROGRAM */}
                      <td className="border border-slate-300 text-center px-1 py-1.5 font-bold text-slate-700">
                        {tx.program}
                      </td>

                      {/* 4. PROG */}
                      <td className="border border-slate-300 text-center px-1 py-1.5 text-slate-700">
                        {tx.prog}
                      </td>

                      {/* 5. KEGIATAN */}
                      <td className="border border-slate-300 text-center px-1 py-1.5 text-slate-700 font-medium">
                        {tx.kegiatan}
                      </td>

                      {/* 6. KODE REKENING */}
                      <td
                        className="border border-slate-300 px-2 py-1.5 text-left font-sans text-[11px] truncate max-w-[280px]"
                        title={tx.kodeRekening}
                      >
                        {tx.kodeRekening}
                      </td>

                      {/* 7. BKU */}
                      <td className="border border-slate-300 text-center px-1.5 py-1.5 font-bold text-blue-900 bg-blue-50/40">
                        {tx.bkuNo || '-'}
                      </td>

                      {/* 8. URAIAN */}
                      <td className="border border-slate-300 px-2 py-1.5 text-left font-sans text-slate-900 font-medium">
                        {tx.uraian}
                      </td>

                      {/* 9. PENERIMAAN */}
                      <td className="border border-slate-300 text-right px-2 py-1.5 font-semibold text-emerald-800 whitespace-nowrap">
                        {(tx.penerimaan || 0) > 0 ? formatRupiah(tx.penerimaan, false) : ''}
                      </td>

                      {/* 10. PENGELUARAN */}
                      <td className="border border-slate-300 text-right px-2 py-1.5 font-semibold text-red-700 whitespace-nowrap">
                        {(tx.pengeluaran || 0) > 0 ? `Rp ${formatRupiah(tx.pengeluaran, false)}` : ''}
                      </td>

                      {/* 11. SALDO */}
                      <td className="border border-slate-300 text-right px-2 py-1.5 font-bold text-slate-900 bg-amber-50/30 whitespace-nowrap">
                        {tx.saldo !== undefined ? `Rp${formatRupiah(tx.saldo, false)}` : '-'}
                      </td>

                      {/* 12. PENERIMA */}
                      <td className="border border-slate-300 px-2 py-1.5 text-left font-sans text-slate-800 truncate max-w-[150px]">
                        {tx.penerima}
                      </td>

                      {/* 13. PPN */}
                      <td className="border border-slate-300 text-right px-1 py-1.5 text-slate-600">
                        {(tx.ppn || 0) > 0 ? formatRupiah(tx.ppn, false) : ''}
                      </td>

                      {/* 14. PPH21 */}
                      <td className="border border-slate-300 text-right px-1 py-1.5 text-slate-600">
                        {(tx.pph21 || 0) > 0 ? formatRupiah(tx.pph21, false) : ''}
                      </td>

                      {/* 15. PPH23 */}
                      <td className="border border-slate-300 text-right px-1 py-1.5 text-slate-600">
                        {(tx.pph23 || 0) > 0 ? formatRupiah(tx.pph23, false) : ''}
                      </td>

                      {/* 16. BARANG PERSEDIAAN */}
                      <td className="border border-slate-300 text-center px-1 py-1.5 text-slate-700 font-sans">
                        {tx.barangPersediaan || 'TIDAK'}
                      </td>

                      {/* 17. AKSI & KELOLA (Clear, prominent EDIT and HAPUS buttons) */}
                      <td
                        className="border border-slate-300 px-2 py-1 text-center font-sans whitespace-nowrap bg-amber-50/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {/* EDIT Button (Prominent) */}
                          <button
                            id={`bku-edit-${tx.id}`}
                            onClick={() => onEditTransaction(tx)}
                            title="Edit data transaksi ini"
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-400 font-bold px-2 py-1 rounded text-[10px] flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-amber-700" />
                            <span>Edit</span>
                          </button>

                          {/* HAPUS Button (Prominent) */}
                          <button
                            id={`bku-delete-${tx.id}`}
                            onClick={() => setTxToDelete(tx)}
                            title="Hapus baris transaksi ini"
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold px-2 py-1 rounded text-[10px] flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>Hapus</span>
                          </button>

                          {/* Print Shortcuts (A2 & Kwitansi) */}
                          {isPengeluaran && (
                            <div className="flex items-center gap-1 pl-1 border-l border-slate-300">
                              <button
                                onClick={() => onSelectTransactionForDoc(tx, 'A2')}
                                title="Lihat & Cetak Bukti Verifikasi A2"
                                className="p-1 text-purple-700 hover:bg-purple-100 rounded border border-purple-200"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onSelectTransactionForDoc(tx, 'KWITANSI')}
                                title="Lihat & Cetak Kwitansi Resmi"
                                className="p-1 text-blue-700 hover:bg-blue-100 rounded border border-blue-200"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Sticky Total Footer (Exact Math) */}
            <tfoot className="sticky bottom-0 z-20 bg-[#FFFF99] text-black font-extrabold border-t-2 border-black">
              <tr>
                <td className="border border-black text-center py-2 bg-[#F5F500]">Σ</td>
                <td colSpan={8} className="border border-black px-3 py-2 text-right uppercase tracking-wider">
                  JUMLAH TOTAL TRANSAKSI KAS:
                </td>
                <td className="border border-black px-2 py-2 text-right text-emerald-900 font-black">
                  {formatRupiah(totalPenerimaan)}
                </td>
                <td className="border border-black px-2 py-2 text-right text-red-900 font-black">
                  {formatRupiah(totalPengeluaran)}
                </td>
                <td className="border border-black px-2 py-2 text-right text-blue-950 font-black bg-[#FFE680]">
                  {formatRupiah(sisaSaldo)}
                </td>
                <td className="border border-black px-2 py-2 text-center text-xs">
                  Sisa Saldo Kas
                </td>
                <td className="border border-black px-1 py-2 text-right">
                  {totalPpn > 0 ? formatRupiah(totalPpn, false) : '-'}
                </td>
                <td className="border border-black px-1 py-2 text-right">
                  {totalPph21 > 0 ? formatRupiah(totalPph21, false) : '-'}
                </td>
                <td className="border border-black px-1 py-2 text-right">
                  {totalPph23 > 0 ? formatRupiah(totalPph23, false) : '-'}
                </td>
                <td colSpan={2} className="border border-black px-2 py-2 text-center text-[10px]">
                  {transactions.length} Data
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. Modal Konfirmasi Hapus Baris Tunggal                    */}
      {/* ========================================================= */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-600 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Konfirmasi Hapus Transaksi</h3>
              </div>
              <button
                onClick={() => setTxToDelete(null)}
                className="text-red-100 hover:text-white p-1 rounded-full hover:bg-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700 text-sm">
                Apakah Anda yakin ingin menghapus baris transaksi berikut dari Buku Kas Umum?
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 font-sans">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">No / BKU:</span>
                  <span className="font-bold text-slate-800">
                    No. {txToDelete.no || '-'} &bull; {txToDelete.bkuNo || '-'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Tanggal:</span>
                  <span className="font-semibold text-slate-800">{txToDelete.tanggal}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Uraian:</span>
                  <span className="font-medium text-slate-900 text-right truncate max-w-[220px]">
                    {txToDelete.uraian}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Nominal:</span>
                  <span
                    className={`font-bold ${
                      (txToDelete.pengeluaran || 0) > 0 ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    Rp {formatRupiah(txToDelete.pengeluaran || txToDelete.penerimaan, false)}
                    <span className="text-[10px] ml-1 font-normal text-slate-500">
                      ({(txToDelete.pengeluaran || 0) > 0 ? 'Pengeluaran' : 'Penerimaan'})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penerima:</span>
                  <span className="font-semibold text-slate-800">{txToDelete.penerima || '-'}</span>
                </div>
              </div>

              <p className="text-slate-500 text-[11px]">
                Perhatian: Tindakan ini tidak dapat dibatalkan. Saldo kas BKU akan dihitung ulang secara otomatis.
              </p>
            </div>

            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. Modal Konfirmasi Hapus Banyak (Batch Delete)            */}
      {/* ========================================================= */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-600 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Hapus {selectedTxIds.length} Transaksi Terpilih</h3>
              </div>
              <button
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="text-red-100 hover:text-white p-1 rounded-full hover:bg-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700 text-sm">
                Apakah Anda yakin ingin menghapus <strong className="text-red-700">{selectedTxIds.length} baris</strong> transaksi yang sedang dipilih?
              </p>
              <p className="text-slate-500 text-[11px]">
                Semua baris transaksi terpilih akan dihapus sekaligus dan saldo Buku Kas Umum akan diperbarui secara otomatis.
              </p>
            </div>

            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus {selectedTxIds.length} Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. Modal Konfirmasi Kosongkan Semua Transaksi              */}
      {/* ========================================================= */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Kosongkan Semua Data BKU</h3>
              </div>
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                className="text-red-100 hover:text-white p-1 rounded-full hover:bg-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700 text-sm">
                Apakah Anda yakin ingin menghapus seluruh <strong className="text-red-700">{transactions.length} baris</strong> data transaksi dari Buku Kas Umum?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
                Tabel akan menjadi kosong. Anda dapat mengimpor file Excel baru atau menambahkan transaksi dari awal kapan saja.
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Kosongkan Semua Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. Modal Konfirmasi Muat Ulang Data Sampel                */}
      {/* ========================================================= */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-sky-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Muat Ulang Data Sampel</h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-sky-100 hover:text-white p-1 rounded-full hover:bg-sky-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700 text-sm">
                Kembalikan data transaksi ke data sampel awal dari dokumen SMK Musanga?
              </p>
              <p className="text-slate-500 text-[11px]">
                Data transaksi kustom yang belum diekspor akan digantikan dengan data sampel awal.
              </p>
            </div>

            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Ya, Muat Data Sampel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
