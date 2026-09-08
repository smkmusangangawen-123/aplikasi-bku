import React, { useState, useRef } from 'react';
import { parseExcelFile, exportBkuTemplateExcel } from '../utils/excelExport';
import { BkuTransaction, AppSettings } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Upload,
  X,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  FileUp,
  Layers,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (transactions: BkuTransaction[], mode: 'replace' | 'append') => void;
  settings: AppSettings;
  currentTransactions: BkuTransaction[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  settings,
  currentTransactions,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<BkuTransaction[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMsg('Format file harus berupa Excel (.xlsx atau .xls).');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setParsedData(null);

    parseExcelFile(
      file,
      (importedData) => {
        setLoading(false);
        setParsedData(importedData);
      },
      (err) => {
        setLoading(false);
        setErrorMsg(err);
      }
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleConfirmImport = () => {
    if (!parsedData || parsedData.length === 0) return;

    setSuccessMsg(
      `Berhasil ${importMode === 'replace' ? 'mengganti seluruh data dengan' : 'menambahkan'} ${parsedData.length} baris transaksi!`
    );

    setTimeout(() => {
      onImportSuccess(parsedData, importMode);
      setParsedData(null);
      setFileName('');
      onClose();
    }, 900);
  };

  const handleResetFile = () => {
    setParsedData(null);
    setFileName('');
    setErrorMsg(null);
    setSuccessMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalPenerimaan = parsedData
    ? parsedData.reduce((sum, t) => sum + (Number(t.penerimaan) || 0), 0)
    : 0;
  const totalPengeluaran = parsedData
    ? parsedData.reduce((sum, t) => sum + (Number(t.pengeluaran) || 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#107C41] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Upload Template Excel BKU</h3>
              <p className="text-xs text-emerald-100">
                Impor data pembukuan Buku Kas Umum secara otomatis dari format Excel (.xlsx)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1.5 rounded-full hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {!parsedData ? (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <FileUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm sm:text-base">
                    {loading ? 'Sedang membaca file Excel...' : 'Tarik & Lepas File Template Excel ke sini'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    atau klik untuk memilih file dari komputer / laptop Anda
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded">
                    Mendukung .xlsx & .xls
                  </span>
                  <span className="text-[11px] bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded">
                    Microsoft Excel / WPS / Google Sheets
                  </span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              {/* Template Download Card */}
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-700" />
                    Belum punya template format Excel?
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Unduh file template resmi berisi 16 kolom BKU lengkap beserta contoh pengisian.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => exportBkuTemplateExcel()}
                  className="shrink-0 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Template (.xlsx)
                </button>
              </div>
            </>
          ) : (
            /* Preview of parsed data */
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-700">File: </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {fileName}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">
                    Terdeteksi <strong className="text-emerald-700">{parsedData.length} baris</strong> transaksi BKU.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFile}
                  className="text-xs text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ganti File Lain
                </button>
              </div>

              {/* Summary of parsed transactions */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                  <span className="text-emerald-700 font-semibold block">Total Penerimaan:</span>
                  <span className="font-bold text-emerald-950 text-sm">
                    {formatRupiah(totalPenerimaan)}
                  </span>
                </div>
                <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg">
                  <span className="text-red-700 font-semibold block">Total Pengeluaran:</span>
                  <span className="font-bold text-red-950 text-sm">
                    {formatRupiah(totalPengeluaran)}
                  </span>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Pilih Cara Memasukkan Data ke BKU:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                      importMode === 'replace'
                        ? 'bg-emerald-50/70 border-emerald-500 font-medium'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Ganti Semua Data</span>
                      <span className="text-[11px] text-slate-500">
                        Hapus data BKU saat ini dan gantikan dengan {parsedData.length} baris dari Excel ini.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                      importMode === 'append'
                        ? 'bg-emerald-50/70 border-emerald-500 font-medium'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Tambahkan ke Data Ada</span>
                      <span className="text-[11px] text-slate-500">
                        Simpan data lama ({currentTransactions.length} baris) dan tambahkan transaksi baru di bawahnya.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview table (up to 5 rows) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    Pratinjau {Math.min(parsedData.length, 5)} dari {parsedData.length} Baris:
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-48 text-[10px]">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="border-b border-slate-200 px-2 py-1.5 text-center">No</th>
                        <th className="border-b border-slate-200 px-2 py-1.5 text-center">Tanggal</th>
                        <th className="border-b border-slate-200 px-2 py-1.5 text-center">BKU</th>
                        <th className="border-b border-slate-200 px-2 py-1.5 text-left">Uraian</th>
                        <th className="border-b border-slate-200 px-2 py-1.5 text-right">Masuk (Rp)</th>
                        <th className="border-b border-slate-200 px-2 py-1.5 text-right">Keluar (Rp)</th>
                        <th className="border-b border-slate-200 px-2 py-1.5 text-left">Penerima</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.slice(0, 5).map((t, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-2 py-1 text-center font-bold text-slate-600">{t.no || i + 1}</td>
                          <td className="px-2 py-1 text-center whitespace-nowrap">{t.tanggal}</td>
                          <td className="px-2 py-1 text-center font-semibold text-blue-900">{t.bkuNo || '-'}</td>
                          <td className="px-2 py-1 text-left truncate max-w-[180px]">{t.uraian}</td>
                          <td className="px-2 py-1 text-right text-emerald-700">
                            {(t.penerimaan || 0) > 0 ? formatRupiah(t.penerimaan, false) : '-'}
                          </td>
                          <td className="px-2 py-1 text-right text-red-700">
                            {(t.pengeluaran || 0) > 0 ? formatRupiah(t.pengeluaran, false) : '-'}
                          </td>
                          <td className="px-2 py-1 text-left truncate max-w-[120px]">{t.penerima}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded transition"
          >
            Batal
          </button>

          {parsedData && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Konfirmasi Impor ({parsedData.length} Baris)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
