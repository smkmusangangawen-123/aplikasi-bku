import React, { useMemo } from 'react';
import { BkuTransaction, AppSettings, ActiveTab } from '../types';
import { formatRupiah } from '../utils/formatters';
import { exportToExcelFile } from '../utils/excelExport';
import { programReferenceMap } from '../data/initialData';
import {
  PieChart,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  TrendingUp,
  Percent,
  Receipt,
  Layers,
  Building,
} from 'lucide-react';

interface AnalysisViewProps {
  settings: AppSettings;
  transactions: BkuTransaction[];
  onNavigate: (tab: ActiveTab) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  settings,
  transactions,
  onNavigate,
}) => {
  // Financial metrics
  const totalPenerimaan = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.penerimaan) || 0), 0),
    [transactions]
  );
  const totalPengeluaran = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.pengeluaran) || 0), 0),
    [transactions]
  );
  const sisaSaldo = totalPenerimaan - totalPengeluaran;
  const persentaseSerapan = totalPenerimaan > 0 ? (totalPengeluaran / totalPenerimaan) * 100 : 0;

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

  // Group by Program
  const programBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    transactions.forEach((tx) => {
      const amount = Number(tx.pengeluaran) || 0;
      if (amount > 0) {
        const prog = tx.program ? tx.program.trim() : 'Lainnya';
        if (!map[prog]) map[prog] = { total: 0, count: 0 };
        map[prog].total += amount;
        map[prog].count += 1;
      }
    });

    return Object.entries(map)
      .map(([progCode, data]) => ({
        code: progCode,
        name: programReferenceMap[progCode] || 'Kegiatan Operasional Lainnya',
        total: data.total,
        count: data.count,
        percentage: totalPengeluaran > 0 ? (data.total / totalPengeluaran) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, totalPengeluaran]);

  // Group by Rekening
  const rekeningBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    transactions.forEach((tx) => {
      const amount = Number(tx.pengeluaran) || 0;
      if (amount > 0) {
        const rek = tx.kodeRekening || 'Tanpa Kode Rekening';
        if (!map[rek]) map[rek] = { total: 0, count: 0 };
        map[rek].total += amount;
        map[rek].count += 1;
      }
    });

    return Object.entries(map)
      .map(([rekName, data]) => ({
        name: rekName,
        total: data.total,
        count: data.count,
        percentage: totalPengeluaran > 0 ? (data.total / totalPengeluaran) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, totalPengeluaran]);

  // Top Penerima
  const vendorBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      const amount = Number(tx.pengeluaran) || 0;
      if (amount > 0 && tx.penerima && tx.penerima !== '-') {
        map[tx.penerima] = (map[tx.penerima] || 0) + amount;
      }
    });

    return Object.entries(map)
      .map(([vendor, total]) => ({ vendor, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }, [transactions]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('INPUT BKU')}
            className="bg-[#C58210] hover:bg-[#A86B07] text-white px-3.5 py-1.5 rounded font-bold text-xs uppercase flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-6 h-6 text-red-600" />
              REKAPITULASI & ANALISIS KAS DANA BOS
            </h2>
            <p className="text-xs text-slate-500">
              Analisis Realisasi Anggaran, Proporsi Belanja & Rekapitulasi Pajak
            </p>
          </div>
        </div>

        <button
          onClick={() => exportToExcelFile(settings, transactions)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-md shadow flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          Ekspor Semua Lembar ke Excel (.xlsx)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Penerimaan
          </span>
          <span className="text-2xl font-black text-emerald-700 block">
            {formatRupiah(totalPenerimaan)}
          </span>
          <p className="text-xs text-slate-500">Pagu anggaran masuk buku kas</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Pengeluaran
          </span>
          <span className="text-2xl font-black text-red-600 block">
            {formatRupiah(totalPengeluaran)}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Percent className="w-3.5 h-3.5 text-blue-600" />
            <span>Serapan: <strong>{persentaseSerapan.toFixed(1)}%</strong></span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Sisa Saldo Kas
          </span>
          <span
            className={`text-2xl font-black block ${
              sisaSaldo >= 0 ? 'text-blue-700' : 'text-rose-700'
            }`}
          >
            {formatRupiah(sisaSaldo)}
          </span>
          <p className="text-xs text-slate-500">Kas tunai tersedia saat ini</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Pajak Potongan
          </span>
          <span className="text-2xl font-black text-purple-700 block">
            {formatRupiah(totalPpn + totalPph21 + totalPph23)}
          </span>
          <div className="text-[11px] text-slate-500 flex gap-2">
            <span>PPN: {formatRupiah(totalPpn)}</span>
            <span>PPh: {formatRupiah(totalPph21 + totalPph23)}</span>
          </div>
        </div>
      </div>

      {/* Program Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Program Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 border-b pb-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Distribusi Realisasi Berdasarkan Program
          </h3>

          <div className="space-y-4">
            {programBreakdown.map((prog) => (
              <div key={prog.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 mr-2">
                      Program {prog.code}
                    </span>
                    <span className="text-slate-600">{prog.name}</span>
                    <span className="text-slate-400 ml-1.5">({prog.count} transaksi)</span>
                  </div>
                  <div className="font-extrabold text-slate-900">
                    {formatRupiah(prog.total)} ({prog.percentage.toFixed(1)}%)
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
                    style={{ width: `${Math.min(prog.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Vendor / Penerima Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 border-b pb-2">
            <Building className="w-4 h-4 text-emerald-600" />
            Penerima / Vendor Terbesar
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {vendorBreakdown.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800">{item.vendor}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {formatRupiah(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kode Rekening Table Detailed Breakdown */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2 border-b pb-2">
          <Receipt className="w-4 h-4 text-amber-600" />
          Rekapitulasi Belanja Berdasarkan Kode Rekening
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b">
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Kode & Nama Rekening Belanja</th>
                <th className="py-2.5 px-3 text-center">Jumlah BPU</th>
                <th className="py-2.5 px-3 text-right">Total Belanja</th>
                <th className="py-2.5 px-3 text-right">Porsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekeningBreakdown.map((rek, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">{rek.name}</td>
                  <td className="py-2 px-3 text-center text-slate-600">{rek.count} kali</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-red-700">
                    {formatRupiah(rek.total)}
                  </td>
                  <td className="py-2 px-3 text-right font-medium text-slate-600">
                    {rek.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/70 font-extrabold text-slate-900 border-t">
                <td colSpan={3} className="py-2.5 px-3 text-right">TOTAL PENGELUARAN :</td>
                <td className="py-2.5 px-3 text-right font-mono text-red-800">
                  {formatRupiah(totalPengeluaran)}
                </td>
                <td className="py-2.5 px-3 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
