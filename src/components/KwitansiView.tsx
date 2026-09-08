import React, { useState, useMemo, useEffect } from 'react';
import { BkuTransaction, AppSettings, ActiveTab } from '../types';
import {
  ArrowLeft,
  Printer,
  ChevronUp,
  ChevronDown,
  Layers,
  FileText,
  Sliders,
  Check,
  Info,
  Maximize2,
  Scissors,
} from 'lucide-react';
import {
  SingleKwitansi,
  KWITANSI_SIZES,
  COLOR_THEMES,
  KwitansiSizeKey,
  KwitansiColorTheme,
} from './SingleKwitansi';
import { PhysicalRuler } from './PhysicalRuler';

export type PrintMode = 'EXACT' | 'A4_SINGLE' | 'A4_TRIPLE';

interface KwitansiViewProps {
  settings: AppSettings;
  transactions: BkuTransaction[];
  selectedTxId?: string;
  onNavigate: (tab: ActiveTab) => void;
}

export const KwitansiView: React.FC<KwitansiViewProps> = ({
  settings,
  transactions,
  selectedTxId,
  onNavigate,
}) => {
  // 1. Only expense transactions can have kwitansi
  const expenseList = useMemo(() => {
    return transactions.filter((t) => (Number(t.pengeluaran) || 0) > 0);
  }, [transactions]);

  // Initial index selection
  const initialIndex = useMemo(() => {
    if (selectedTxId) {
      const found = expenseList.findIndex((t) => t.id === selectedTxId);
      if (found >= 0) return found;
    }
    const bpu24Index = expenseList.findIndex((t) => t.bkuNo === 'BPU24');
    return bpu24Index >= 0 ? bpu24Index : Math.max(0, expenseList.length - 1);
  }, [expenseList, selectedTxId]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  // Settings & display options
  const [sizeKey, setSizeKey] = useState<KwitansiSizeKey>('SEDANG');
  const [printMode, setPrintMode] = useState<PrintMode>('A4_SINGLE');
  const [showStub, setShowStub] = useState<boolean>(true);
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [materaiMode, setMateraiMode] = useState<'AUTO' | 'ALWAYS' | 'NEVER'>('AUTO');
  const [colorTheme, setColorTheme] = useState<KwitansiColorTheme>('BLUE');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);

  const currentTx = expenseList[currentIndex] || expenseList[0] || transactions[0];
  const activeSize = KWITANSI_SIZES[sizeKey];
  const effectiveWidthMm = showStub
    ? activeSize.widthMm
    : activeSize.widthMm - activeSize.stubWidthMm;

  // 3 consecutive transactions for A4_TRIPLE mode
  const tripleTransactions = useMemo(() => {
    const list: BkuTransaction[] = [];
    for (let i = 0; i < 3; i++) {
      const targetIdx = currentIndex + i;
      if (targetIdx < expenseList.length) {
        list.push(expenseList[targetIdx]);
      }
    }
    return list;
  }, [expenseList, currentIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < expenseList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const matchIndex = expenseList.findIndex(
        (t) =>
          t.no === val ||
          t.bkuNo === `BPU${val}` ||
          t.bkuNo === `BPU${String(val).padStart(2, '0')}`
      );
      if (matchIndex >= 0) {
        setCurrentIndex(matchIndex);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Keyboard shortcut Ctrl+P / Cmd+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const bkuNumeric = currentTx?.bkuNo
    ? currentTx.bkuNo.replace(/\D/g, '') || String(currentTx.no)
    : String(currentTx?.no || 1);

  if (expenseList.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl p-8 border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Belum Ada Transaksi Pengeluaran</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Kwitansi otomatis dicetak dari transaksi yang memiliki nilai belanja (pengeluaran). Silakan tambahkan transaksi pengeluaran di menu BKU.
        </p>
        <button
          onClick={() => onNavigate('INPUT BKU')}
          className="bg-[#107C41] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#0E6B37] transition"
        >
          Ke Input BKU
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center space-y-5">
      {/* DYNAMIC PRINT CSS */}
      <style>
        {`
        @media print {
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${
            printMode === 'EXACT'
              ? `
              @page {
                size: ${effectiveWidthMm}mm ${activeSize.heightMm}mm;
                margin: 0mm;
              }
              .kwitansi-print-container {
                width: ${effectiveWidthMm}mm !important;
                height: ${activeSize.heightMm}mm !important;
                margin: 0 !important;
                padding: 0 !important;
                transform: none !important;
              }
              `
              : printMode === 'A4_SINGLE'
              ? `
              @page {
                size: A4 portrait;
                margin: 8mm 6mm;
              }
              .kwitansi-print-container {
                margin: 0 auto !important;
                transform: none !important;
              }
              `
              : `
              @page {
                size: A4 portrait;
                margin: 6mm 6mm;
              }
              .kwitansi-print-container {
                margin: 0 auto !important;
                transform: none !important;
              }
              `
          }
        }
        `}
      </style>

      {/* TOP CONTROL BAR (HIDDEN IN PRINT) */}
      <div className="w-full max-w-6xl bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col gap-3 print:hidden">
        {/* Row 1: Back, Title, Stepper, and PRINT */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3">
            <button
              id="kwitansi-back-btn"
              onClick={() => onNavigate('INPUT BKU')}
              className="bg-[#8C531B] hover:bg-[#6D3F12] text-white px-3.5 py-1.5 rounded-md font-bold text-xs uppercase flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  CETAK KWITANSI PEMBAYARAN BOS
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {activeSize.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Dimensi Fisik Asli: {activeSize.widthMm / 10} cm × {activeSize.heightMm / 10} cm &bull; BPU {currentTx?.bkuNo || currentTx?.no} ({currentIndex + 1} dari {expenseList.length} transaksi)
              </p>
            </div>
          </div>

          {/* Right: Stepper and PRINT Button */}
          <div className="flex items-center gap-2.5">
            {/* Transaction Dropdown Selector */}
            <select
              value={currentTx?.id || ''}
              onChange={(e) => {
                const idx = expenseList.findIndex((t) => t.id === e.target.value);
                if (idx >= 0) setCurrentIndex(idx);
              }}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold bg-slate-50 text-slate-800 max-w-[190px] outline-none"
            >
              {expenseList.map((tx, idx) => (
                <option key={tx.id} value={tx.id}>
                  {idx + 1}. {tx.bkuNo || `No.${tx.no}`} - {tx.penerima}
                </option>
              ))}
            </select>

            {/* Stepper with number input matching classic layout */}
            <div className="flex items-center border-2 border-black bg-white rounded overflow-hidden shadow-xs">
              <input
                type="text"
                value={bkuNumeric}
                onChange={handleIndexChange}
                className="w-11 text-center text-base font-extrabold text-black outline-none"
                title="Ketik nomor BPU"
              />
              <div className="flex flex-col border-l border-black">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border-b border-black disabled:opacity-30 cursor-pointer"
                  title="Sebelumnya"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex >= expenseList.length - 1}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                  title="Berikutnya"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* PRINT Button */}
            <button
              id="kwitansi-print-btn"
              onClick={handlePrint}
              className="bg-gradient-to-b from-[#33A9B8] to-[#1C7F8C] hover:from-[#2B95A2] hover:to-[#176B76] text-white font-black text-sm px-5 py-2 rounded-md shadow-sm flex items-center gap-2 uppercase tracking-wider transition active:scale-95 border border-[#146672] cursor-pointer"
              title="Cetak Kwitansi (Ctrl+P)"
            >
              <Printer className="w-4 h-4" />
              PRINT
            </button>
          </div>
        </div>

        {/* Row 2: Standard Physical Size Presets (UKURAN KWITANSI ASLI) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-blue-600" />
              Ukuran Asli:
            </span>
            {(Object.keys(KWITANSI_SIZES) as KwitansiSizeKey[]).map((key) => {
              const item = KWITANSI_SIZES[key];
              const isSelected = sizeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSizeKey(key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex flex-col items-start cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title={item.description}
                >
                  <div className="flex items-center gap-1">
                    <span>{item.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className={`text-[9.5px] font-normal ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.sublabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mode Cetak (Print Target) */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-1.5">Mode Cetak:</span>
            <button
              onClick={() => setPrintMode('A4_SINGLE')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                printMode === 'A4_SINGLE'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cetak 1 Kwitansi di Kertas A4 lengkap dengan garis potong gunting"
            >
              1 Kwitansi di A4 ✂
            </button>
            <button
              onClick={() => setPrintMode('A4_TRIPLE')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                printMode === 'A4_TRIPLE'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cetak 3 Kwitansi bertingkat dalam 1 lembar A4 (Mode Hemat Kertas BOS)"
            >
              3 Kwitansi per A4 (Hemat)
            </button>
            <button
              onClick={() => setPrintMode('EXACT')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                printMode === 'EXACT'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cetak pas ukuran asli langsung ke kertas kwitansi atau custom paper"
            >
              Pas Kertas Kwitansi
            </button>
          </div>
        </div>

        {/* Row 3: Detail toggles (Bonggol, Materai, Ruler, Color Theme, Zoom) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-4">
            {/* Toggle Bonggol / Stub */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                checked={showStub}
                onChange={(e) => setShowStub(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Sertakan Bonggol (Susur Arsip)</span>
            </label>

            {/* Toggle Ruler */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                checked={showRuler}
                onChange={(e) => setShowRuler(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <span>Tampilkan Penggaris cm</span>
            </label>

            {/* Materai Selector */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Materai:</span>
              <select
                value={materaiMode}
                onChange={(e) => setMateraiMode(e.target.value as any)}
                className="border border-slate-300 rounded px-1.5 py-0.5 text-xs bg-white text-slate-800"
              >
                <option value="AUTO">Otomatis (≥ 5 Juta)</option>
                <option value="ALWAYS">Selalu Tampilkan</option>
                <option value="NEVER">Tanpa Materai</option>
              </select>
            </div>

            {/* Color Theme Selector */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Warna:</span>
              <div className="flex items-center gap-1">
                {(Object.keys(COLOR_THEMES) as KwitansiColorTheme[]).map((themeKey) => {
                  const t = COLOR_THEMES[themeKey];
                  const isSelected = colorTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => setColorTheme(themeKey)}
                      style={{ backgroundColor: t.hex }}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        isSelected ? 'ring-2 ring-blue-500 border-white scale-110' : 'border-white opacity-80 hover:opacity-100'
                      }`}
                      title={t.name}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Skala Layar:</span>
            <div className="inline-flex rounded-md shadow-2xs border border-slate-300 bg-white">
              <button
                onClick={() => setZoomScale(1)}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-l ${
                  zoomScale === 1 ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Skala 100% Ukuran Fisik Sebenarnya"
              >
                100% (Asli)
              </button>
              <button
                onClick={() => setZoomScale(0.85)}
                className={`px-2 py-0.5 text-[11px] font-semibold border-l border-slate-200 ${
                  zoomScale === 0.85 ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                85%
              </button>
              <button
                onClick={() => setZoomScale(0.7)}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-r border-l border-slate-200 ${
                  zoomScale === 0.7 ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                70%
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WORKSPACE PREVIEW CONTAINER */}
      <div className="w-full flex flex-col items-center overflow-x-auto py-2 px-1">
        {/* PRINT MODE: A4 TRIPLE (3 Kwitansi per Lembar A4) */}
        {printMode === 'A4_TRIPLE' ? (
          <div className="flex flex-col items-center">
            {/* Visual sheet mimicking A4 portrait */}
            <div className="w-full max-w-[215mm] bg-white border border-slate-300 shadow-lg p-3 sm:p-5 rounded print:shadow-none print:border-none print:p-0 print:m-0">
              <div className="text-center pb-3 text-xs text-slate-500 font-medium print:hidden flex items-center justify-center gap-2">
                <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-bold">
                  Mode 3 Kwitansi per Halaman A4
                </span>
                <span>(Menampilkan transaksi #{currentIndex + 1} s.d. #{Math.min(currentIndex + 3, expenseList.length)})</span>
              </div>

              <div className="space-y-4 print:space-y-3">
                {tripleTransactions.map((tx, idx) => (
                  <div key={tx.id} className="relative">
                    {/* Cut Guide Line between receipts */}
                    {idx > 0 && (
                      <div className="my-2 border-t-2 border-dashed border-slate-400 relative flex items-center justify-center">
                        <span className="bg-white px-2 text-[10px] text-slate-400 font-mono -mt-2">
                          ✂ GARIS POTONG KWITANSI ✂
                        </span>
                      </div>
                    )}

                    <div className="flex justify-center kwitansi-print-container">
                      <SingleKwitansi
                        transaction={tx}
                        settings={settings}
                        sizeKey={sizeKey}
                        colorTheme={colorTheme}
                        showStub={showStub}
                        materaiMode={materaiMode}
                        scale={zoomScale}
                        className="shadow-sm border border-slate-200 print:shadow-none print:border-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : printMode === 'A4_SINGLE' ? (
          /* PRINT MODE: A4 SINGLE (1 Kwitansi di A4 dengan Garis Potong ✂) */
          <div className="flex flex-col items-center">
            {/* Ruler above kwitansi if enabled */}
            {showRuler && (
              <div className="mb-0.5 print:hidden" style={{ transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined, transformOrigin: 'bottom center' }}>
                <PhysicalRuler
                  widthMm={effectiveWidthMm}
                  label={`Ukuran Fisik: ${effectiveWidthMm / 10} cm × ${activeSize.heightMm / 10} cm`}
                />
              </div>
            )}

            {/* Container with cut marks */}
            <div
              className="relative bg-white p-3 sm:p-5 border-2 border-dashed border-slate-400 rounded shadow-md print:shadow-none print:border-none print:p-0 print:m-0 kwitansi-print-container"
              style={{ transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined, transformOrigin: 'top center' }}
            >
              {/* Corner Cutting Marks */}
              <div className="absolute -top-3 -left-3 text-slate-400 text-xs font-mono select-none print:block">
                ✂ ┌
              </div>
              <div className="absolute -top-3 -right-3 text-slate-400 text-xs font-mono select-none print:block">
                ┐ ✂
              </div>
              <div className="absolute -bottom-3 -left-3 text-slate-400 text-xs font-mono select-none print:block">
                ✂ └
              </div>
              <div className="absolute -bottom-3 -right-3 text-slate-400 text-xs font-mono select-none print:block">
                ┘ ✂
              </div>

              {/* Single Kwitansi Component */}
              <SingleKwitansi
                transaction={currentTx}
                settings={settings}
                sizeKey={sizeKey}
                colorTheme={colorTheme}
                showStub={showStub}
                materaiMode={materaiMode}
                scale={1}
                className="shadow-xs print:shadow-none"
              />
            </div>

            {/* Sub-label info */}
            <p className="text-[11px] text-slate-500 pt-3 text-center print:hidden">
              Garis putus-putus dan tanda gunting ✂ menandai batas ukuran asli ({effectiveWidthMm / 10} cm × {activeSize.heightMm / 10} cm) untuk dipotong rapi setelah dicetak di kertas HVS A4.
            </p>
          </div>
        ) : (
          /* PRINT MODE: EXACT (Pas Kertas Kwitansi Asli) */
          <div className="flex flex-col items-center">
            {/* Physical Ruler above Kwitansi */}
            {showRuler && (
              <div className="mb-0.5 print:hidden" style={{ transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined, transformOrigin: 'bottom center' }}>
                <PhysicalRuler
                  widthMm={effectiveWidthMm}
                  label={`Ukuran Fisik: ${effectiveWidthMm / 10} cm × ${activeSize.heightMm / 10} cm`}
                />
              </div>
            )}

            {/* Kwitansi Container */}
            <div
              className="kwitansi-print-container shadow-lg border border-slate-300 rounded overflow-hidden print:shadow-none print:border-none print:m-0"
              style={{ transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined, transformOrigin: 'top center' }}
            >
              <SingleKwitansi
                transaction={currentTx}
                settings={settings}
                sizeKey={sizeKey}
                colorTheme={colorTheme}
                showStub={showStub}
                materaiMode={materaiMode}
                scale={1}
                className="print:shadow-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* EDUCATIONAL FOOTER / PRINTING TIPS (HIDDEN IN PRINT) */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 shadow-xs print:hidden space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Panduan Ukuran Kwitansi Asli Standar Indonesia:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11.5px] leading-relaxed">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
            <span className="font-bold text-slate-800 block text-xs">1. Standar Sedang (28.5 × 9 cm)</span>
            <p className="text-slate-500 pt-0.5">
              Ukuran buku kwitansi toko ATK (seperti Paperline / Kiky). Memiliki susur arsip di sebelah kiri dan lembar utama di kanan.
            </p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
            <span className="font-bold text-slate-800 block text-xs">2. Format Besar (32 × 10 cm)</span>
            <p className="text-slate-500 pt-0.5">
              Ukuran buku kwitansi panjang untuk uraian transaksi lengkap, tanda tangan 3 pejabat, dan kotak bea materai resmi.
            </p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
            <span className="font-bold text-slate-800 block text-xs">3. Mode Hemat A4 (3 per Lembar)</span>
            <p className="text-slate-500 pt-0.5">
              Sangat direkomendasikan untuk SPJ BOS. 1 Lembar HVS A4 dapat memuat 3 kwitansi belanja sekaligus dengan garis potong rapi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
