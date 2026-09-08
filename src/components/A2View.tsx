import React, { useState, useMemo } from 'react';
import { BkuTransaction, AppSettings, ActiveTab } from '../types';
import { terbilang, formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { programReferenceMap, subProgramReferenceMap } from '../data/initialData';
import {
  ArrowLeft,
  Printer,
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

interface A2ViewProps {
  settings: AppSettings;
  transactions: BkuTransaction[];
  selectedTxId?: string;
  onNavigate: (tab: ActiveTab) => void;
}

export const A2View: React.FC<A2ViewProps> = ({
  settings,
  transactions,
  selectedTxId,
  onNavigate,
}) => {
  // Only expense transactions are applicable for A2 payment voucher
  const expenseList = useMemo(() => {
    return transactions.filter((t) => (Number(t.pengeluaran) || 0) > 0);
  }, [transactions]);

  // Find currently active index
  const initialIndex = useMemo(() => {
    if (selectedTxId) {
      const found = expenseList.findIndex((t) => t.id === selectedTxId);
      if (found >= 0) return found;
    }
    // Default to BPU22 if available or last
    const bpu22Index = expenseList.findIndex((t) => t.bkuNo === 'BPU22');
    return bpu22Index >= 0 ? bpu22Index : Math.max(0, expenseList.length - 1);
  }, [expenseList, selectedTxId]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const currentTx = expenseList[currentIndex] || expenseList[0] || transactions[0];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < expenseList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      // Find transaction with matching no or BPU
      const matchIndex = expenseList.findIndex(
        (t) => t.no === val || t.bkuNo === `BPU${val}` || t.bkuNo === `BPU${String(val).padStart(2, '0')}`
      );
      if (matchIndex >= 0) {
        setCurrentIndex(matchIndex);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Program & Subprogram descriptions
  const progDesc = currentTx?.program ? programReferenceMap[currentTx.program] || 'Standar Proses' : '';
  const subProgDesc = currentTx?.prog ? subProgramReferenceMap[currentTx.prog] || 'Pelaksanaan Administrasi Kegiatan Sekolah' : '';

  // Extract numeric part of BKU for the spinner box
  const bkuNumeric = currentTx?.bkuNo
    ? currentTx.bkuNo.replace(/\D/g, '') || String(currentTx.no)
    : String(currentTx?.no || 1);

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Action Toolbar (Hidden during Print) */}
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            id="a2-back-btn"
            onClick={() => onNavigate('INPUT BKU')}
            className="bg-[#C58210] hover:bg-[#A86B07] text-white px-3.5 py-1.5 rounded font-bold text-xs uppercase flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
              LEMBAR VERIFIKASI / BUKTI PENGELUARAN KAS (MODEL A2)
            </h2>
            <p className="text-xs text-slate-500">
              Transaksi {currentIndex + 1} dari {expenseList.length} Belanja Kas
            </p>
          </div>
        </div>

        {/* Record Navigator & Print Controls */}
        <div className="flex items-center gap-3">
          {/* Direct Dropdown */}
          <select
            value={currentTx?.id || ''}
            onChange={(e) => {
              const idx = expenseList.findIndex((t) => t.id === e.target.value);
              if (idx >= 0) setCurrentIndex(idx);
            }}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold bg-slate-50 text-slate-800 max-w-[200px]"
          >
            {expenseList.map((tx, idx) => (
              <option key={tx.id} value={tx.id}>
                {tx.bkuNo || `No.${tx.no}`} - {tx.uraian.slice(0, 20)}
              </option>
            ))}
          </select>

          {/* Stepper with Up/Down buttons (Faithful to Excel spinner in Image 3) */}
          <div className="flex items-center border-2 border-black bg-white rounded overflow-hidden shadow-sm">
            <input
              type="text"
              value={bkuNumeric}
              onChange={handleIndexChange}
              className="w-12 text-center text-lg font-extrabold text-black outline-none"
              title="Ketik nomor BPU"
            />
            <div className="flex flex-col border-l border-black">
              <button
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border-b border-black disabled:opacity-30"
                title="Sebelumnya"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= expenseList.length - 1}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                title="Berikutnya"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Teal PRINT Button matching Image 3 */}
          <button
            id="a2-print-btn"
            onClick={handlePrint}
            className="bg-[#2495A2] hover:bg-[#1C7A85] text-white font-black text-sm px-5 py-2.5 rounded shadow flex items-center gap-2 uppercase tracking-wider transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            PRINT
          </button>
        </div>
      </div>

      {/* Sheet A2 Paper Display (Faithful to Image 3) */}
      <div className="w-full max-w-4xl bg-white border-2 border-blue-700 p-6 sm:p-8 shadow-md text-slate-900 font-sans print:shadow-none print:border-blue-700 print:m-0 print:p-6 print:max-w-none">
        {/* Border wrapper with blue outline like Image 3 */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Top Info Table */}
          <div className="grid grid-cols-12 gap-y-1.5 border-b border-slate-300 pb-3">
            <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">Nomor</div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 sm:col-span-9 font-extrabold text-blue-900 text-sm">
              {currentTx?.bkuNo || `BPU${currentTx?.no}`}
            </div>

            <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">Tanggal</div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 sm:col-span-9 font-medium">
              {formatTanggalIndo(currentTx?.tanggal || '')}
            </div>

            <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">Sub Unit Organisasi</div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 sm:col-span-9">
              {settings.subUnitOrganisasi || settings.pemerintahan || '-'}
            </div>

            <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">Satuan Pendidikan</div>
            <div className="col-span-1 text-center font-bold">:</div>
            <div className="col-span-8 sm:col-span-9 font-black text-black uppercase tracking-wide">
              {settings.namaSekolah}
            </div>
          </div>

          {/* Penerimaan Statement */}
          <div className="py-1">
            <p className="font-semibold text-slate-800">
              Sudah diterima dari Bendahara Pengeluaran,
            </p>
            <div className="grid grid-cols-12 gap-y-1 mt-1.5 items-center">
              <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">uang sejumlah</div>
              <div className="col-span-1 text-center font-bold">:</div>
              <div className="col-span-8 sm:col-span-9 font-black text-base text-black bg-slate-100/60 px-2 py-0.5 rounded border border-slate-200 inline-block">
                {formatRupiah(currentTx?.pengeluaran || 0)}
              </div>
            </div>
          </div>

          {/* Terbilang Box (Fixes the #NAME? error from Image 3!) */}
          <div className="bg-slate-50 border-2 border-emerald-600/70 p-3 rounded text-slate-900">
            <span className="block text-[11px] font-bold uppercase text-emerald-800 tracking-wider mb-0.5">
              Terbilang:
            </span>
            <span className="font-serif italic font-bold text-base text-slate-900 block leading-snug">
              {terbilang(currentTx?.pengeluaran || 0)}
            </span>
          </div>

          {/* Payment Detail Section */}
          <div className="space-y-1.5 border-t border-b border-slate-300 py-3">
            <p className="font-bold text-slate-800 underline uppercase tracking-wide text-xs">
              Yaitu untuk Pembayaran :
            </p>

            <div className="grid grid-cols-12 gap-y-1.5 pt-1">
              <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">Program</div>
              <div className="col-span-1 text-center font-bold">:</div>
              <div className="col-span-8 sm:col-span-9">
                <span className="font-mono font-bold mr-2">{currentTx?.program}</span>
                <span>{progDesc}</span>
              </div>

              <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">Sub Program</div>
              <div className="col-span-1 text-center font-bold">:</div>
              <div className="col-span-8 sm:col-span-9">
                <span className="font-mono font-bold mr-2">{currentTx?.prog}</span>
                <span>{subProgDesc}</span>
              </div>

              <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">Kegiatan</div>
              <div className="col-span-1 text-center font-bold">:</div>
              <div className="col-span-8 sm:col-span-9">
                <span className="font-mono font-bold mr-2">{currentTx?.kegiatan}</span>
                <span>{subProgDesc}</span>
              </div>

              <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">Rekening</div>
              <div className="col-span-1 text-center font-bold">:</div>
              <div className="col-span-8 sm:col-span-9 font-medium text-slate-900">
                {currentTx?.kodeRekening || '-'}
              </div>

              <div className="col-span-3 sm:col-span-2 font-bold text-slate-700">Untuk Keperluan</div>
              <div className="col-span-1 text-center font-bold">:</div>
              <div className="col-span-8 sm:col-span-9 font-bold text-black">
                {currentTx?.uraian}
              </div>
            </div>
          </div>

          {/* Recipient & Tax Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Left: Diterima oleh */}
            <div className="space-y-1 bg-slate-50/50 p-2.5 rounded border border-slate-200">
              <p className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b pb-1">
                Diterima oleh :
              </p>
              <div className="grid grid-cols-12 gap-y-1 text-xs">
                <div className="col-span-4 font-semibold text-slate-600">Nama</div>
                <div className="col-span-1 text-center">:</div>
                <div className="col-span-7 font-bold text-slate-900">{currentTx?.penerima || '-'}</div>

                <div className="col-span-4 font-semibold text-slate-600">NPWP</div>
                <div className="col-span-1 text-center">:</div>
                <div className="col-span-7 text-slate-700">{currentTx?.npwp || '-'}</div>

                <div className="col-span-4 font-semibold text-slate-600">Alamat</div>
                <div className="col-span-1 text-center">:</div>
                <div className="col-span-7 text-slate-700">
                  {currentTx?.alamat || `${settings.kecamatan}, ${settings.pemerintahan}`}
                </div>

                <div className="col-span-4 font-semibold text-slate-600">Info Tambahan</div>
                <div className="col-span-1 text-center">:</div>
                <div className="col-span-7 text-slate-700">{currentTx?.infoTambahan || '-'}</div>
              </div>
            </div>

            {/* Right: Potongan Pajak */}
            <div className="space-y-1 bg-slate-50/50 p-2.5 rounded border border-slate-200">
              <p className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b pb-1">
                Informasi Potongan Pajak :
              </p>
              <div className="grid grid-cols-12 gap-y-1 text-xs">
                <div className="col-span-4 font-semibold text-slate-600">PPN</div>
                <div className="col-span-1 text-center">:</div>
                <div className="col-span-7 font-mono font-medium text-slate-900">
                  {currentTx?.ppn ? formatRupiah(currentTx.ppn) : 'Rp -'}
                </div>

                <div className="col-span-4 font-semibold text-slate-600">PPH 21</div>
                <div className="col-span-1 text-center">:</div>
                <div className="col-span-7 font-mono font-medium text-slate-900">
                  {currentTx?.pph21 ? formatRupiah(currentTx.pph21) : 'Rp -'}
                </div>

                <div className="col-span-4 font-semibold text-slate-600">PPH 23</div>
                <div className="col-span-1 text-center">:</div>
                <div className="col-span-7 font-mono font-medium text-slate-900">
                  {currentTx?.pph23 ? formatRupiah(currentTx.pph23) : 'Rp -'}
                </div>
              </div>
            </div>
          </div>

          {/* 3 Signatures Table (Exact match to Image 3) */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-6 border-t border-slate-300">
            {/* Column 1: Yang Menerima Barang */}
            <div className="flex flex-col justify-between h-36">
              <div>
                <p className="font-medium text-slate-700">Yang menerima barang,</p>
              </div>
              <div>
                <div className="border-b border-black w-36 mx-auto mb-1"></div>
                <p className="font-bold text-slate-800">{currentTx?.penerima || '.........................'}</p>
              </div>
            </div>

            {/* Column 2: Bendahara Sekolah */}
            <div className="flex flex-col justify-between h-36">
              <div>
                <p className="font-medium text-slate-700">Bendahara Sekolah,</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 underline">{settings.namaBendahara}</p>
                <p className="text-[11px] text-slate-600">NIP. {settings.nipBendahara || '-'}</p>
              </div>
            </div>

            {/* Column 3: Kepala Sekolah with Date */}
            <div className="flex flex-col justify-between h-36">
              <div>
                <p className="text-slate-700">
                  {settings.kotaKabupaten || settings.kecamatan}, {formatTanggalIndo(currentTx?.tanggal || '')}
                </p>
                <p className="font-medium text-slate-700 mt-0.5">
                  Kepala {settings.namaSekolah},
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-900 underline">{settings.namaKepalaSekolah}</p>
                <p className="text-[11px] text-slate-600">NIP. {settings.nipKepalaSekolah || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
