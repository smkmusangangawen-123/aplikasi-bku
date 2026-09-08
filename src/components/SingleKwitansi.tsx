import React from 'react';
import { BkuTransaction, AppSettings } from '../types';
import { terbilang, formatRupiah, formatTanggalIndo } from '../utils/formatters';

export type KwitansiSizeKey = 'SEDANG' | 'BESAR' | 'KECIL' | 'A4_THIRD';
export type KwitansiColorTheme = 'BLUE' | 'GREEN' | 'BROWN' | 'BLACK';

export interface KwitansiSizeConfig {
  key: KwitansiSizeKey;
  label: string;
  sublabel: string;
  widthMm: number;
  heightMm: number;
  stubWidthMm: number;
  description: string;
}

export const KWITANSI_SIZES: Record<KwitansiSizeKey, KwitansiSizeConfig> = {
  SEDANG: {
    key: 'SEDANG',
    label: 'Sedang (28.5 × 9 cm)',
    sublabel: 'Standar Buku Kwitansi Paperline',
    widthMm: 285,
    heightMm: 90,
    stubWidthMm: 68,
    description: 'Ukuran kwitansi asli yang paling banyak digunakan di instansi, sekolah, dan toko ATK.',
  },
  BESAR: {
    key: 'BESAR',
    label: 'Besar (32 × 10 cm)',
    sublabel: 'Format Panjang / Continuous',
    widthMm: 320,
    heightMm: 100,
    stubWidthMm: 76,
    description: 'Ukuran buku kwitansi besar untuk uraian panjang dan arsip tebal.',
  },
  KECIL: {
    key: 'KECIL',
    label: 'Kecil (21.5 × 7.5 cm)',
    sublabel: 'Format Saku / Pocket',
    widthMm: 215,
    heightMm: 75,
    stubWidthMm: 52,
    description: 'Ukuran buku kwitansi saku mini untuk transaksi praktis ringkas.',
  },
  A4_THIRD: {
    key: 'A4_THIRD',
    label: '1/3 A4 (21 × 9.9 cm)',
    sublabel: 'Pas Kertas HVS Kantor / F4',
    widthMm: 210,
    heightMm: 99,
    stubWidthMm: 50,
    description: 'Ukuran efisien untuk dicetak pada kertas HVS standar A4/F4 yang dipotong 3.',
  },
};

export const COLOR_THEMES: Record<
  KwitansiColorTheme,
  {
    name: string;
    borderClass: string;
    textAccentClass: string;
    bgAccentClass: string;
    hex: string;
  }
> = {
  BLUE: {
    name: 'Biru Klasik (Paperline)',
    borderClass: 'border-blue-900',
    textAccentClass: 'text-blue-900',
    bgAccentClass: 'bg-blue-50',
    hex: '#1e3a8a',
  },
  GREEN: {
    name: 'Hijau Kas BOS',
    borderClass: 'border-emerald-900',
    textAccentClass: 'text-emerald-900',
    bgAccentClass: 'bg-emerald-50',
    hex: '#064e3b',
  },
  BROWN: {
    name: 'Coklat Vintage',
    borderClass: 'border-amber-950',
    textAccentClass: 'text-amber-950',
    bgAccentClass: 'bg-amber-50',
    hex: '#451a03',
  },
  BLACK: {
    name: 'Hitam Formal Monokrom',
    borderClass: 'border-slate-950',
    textAccentClass: 'text-slate-950',
    bgAccentClass: 'bg-slate-100',
    hex: '#0f172a',
  },
};

interface SingleKwitansiProps {
  transaction: BkuTransaction;
  settings: AppSettings;
  sizeKey: KwitansiSizeKey;
  colorTheme: KwitansiColorTheme;
  showStub: boolean;
  materaiMode: 'AUTO' | 'ALWAYS' | 'NEVER';
  scale?: number;
  className?: string;
  isPrintPreview?: boolean;
}

export const SingleKwitansi: React.FC<SingleKwitansiProps> = ({
  transaction,
  settings,
  sizeKey,
  colorTheme,
  showStub,
  materaiMode,
  scale = 1,
  className = '',
  isPrintPreview = false,
}) => {
  const size = KWITANSI_SIZES[sizeKey];
  const theme = COLOR_THEMES[colorTheme];

  const nominal = Number(transaction.pengeluaran) || 0;
  const bkuNumeric = transaction.bkuNo
    ? transaction.bkuNo.replace(/\D/g, '') || String(transaction.no)
    : String(transaction.no || 1);

  // Materai rule: Indonesian stamp duty (Bea Meterai) applies for >= Rp 5.000.000
  const showMaterai =
    materaiMode === 'ALWAYS' || (materaiMode === 'AUTO' && nominal >= 5000000);

  // Calculate widths
  const effectiveWidthMm = showStub ? size.widthMm : size.widthMm - size.stubWidthMm;
  const mainWidthMm = size.widthMm - size.stubWidthMm;

  // Typography scale according to size
  const isMini = sizeKey === 'KECIL';
  const isA4Third = sizeKey === 'A4_THIRD';

  return (
    <div
      style={{
        width: `${effectiveWidthMm}mm`,
        height: `${size.heightMm}mm`,
        minHeight: `${size.heightMm}mm`,
        maxHeight: `${size.heightMm}mm`,
        boxSizing: 'border-box',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
      className={`relative bg-white text-slate-900 select-text overflow-hidden flex flex-row ${className}`}
    >
      {/* LEFT: Bonggol / Susur Kwitansi (Receipt Stub for bookkeeping archive) */}
      {showStub && (
        <div
          style={{
            width: `${size.stubWidthMm}mm`,
            height: `${size.heightMm}mm`,
          }}
          className={`shrink-0 border-r-2 border-dashed border-slate-400 p-2 sm:p-2.5 flex flex-col justify-between bg-stone-50/70 select-text relative`}
        >
          {/* Binding Margin Staples dots on far left */}
          <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-around py-3 opacity-30 pointer-events-none print:hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 block" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 block" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 block" />
          </div>

          {/* Stub Header */}
          <div className="pl-2">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                SUSUR BKU
              </span>
              <span className={`text-[10px] font-mono font-black ${theme.textAccentClass}`}>
                No. {transaction.bkuNo || bkuNumeric}
              </span>
            </div>

            {/* Stub Body Key-Value pairs */}
            <div className="space-y-1 pt-1.5 text-[8.5px] leading-tight">
              <div>
                <span className="text-slate-500 block text-[7.5px]">Diterima Dari:</span>
                <span className="font-semibold text-slate-800 line-clamp-1">
                  Bendahara BOS
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[7.5px]">Uang Sejumlah:</span>
                <span className="font-bold text-black font-mono">
                  {formatRupiah(nominal)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[7.5px]">Untuk:</span>
                <span className="text-slate-800 line-clamp-2 italic">
                  {transaction.uraian}
                </span>
              </div>
            </div>
          </div>

          {/* Stub Footer / Short Signature */}
          <div className="pl-2 pt-1 border-t border-slate-200 flex flex-col items-center text-center">
            <span className="text-[7.5px] text-slate-500">
              {formatTanggalIndo(transaction.tanggal)}
            </span>
            <div className="w-full pt-4">
              <div className="border-b border-dotted border-slate-400 w-4/5 mx-auto" />
              <span className="text-[7.5px] text-slate-600 block pt-0.5">
                ( {transaction.penerima || 'Penerima'} )
              </span>
            </div>
          </div>

          {/* Scissor / Perforation Indicator */}
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 bg-white px-0.5 py-1 text-[10px] text-slate-400 select-none print:hidden pointer-events-none">
            ✂
          </div>
        </div>
      )}

      {/* RIGHT: Lembar Utama Kwitansi Asli (Main Official Receipt) */}
      <div
        style={{
          width: showStub ? `${mainWidthMm}mm` : '100%',
          height: `${size.heightMm}mm`,
        }}
        className={`flex-1 p-2.5 sm:p-3 flex flex-col justify-between relative bg-white`}
      >
        {/* Authentic Border: Outer frame and Inner subtle accent line */}
        <div
          className={`absolute inset-1.5 sm:inset-2 border-2 ${theme.borderClass} pointer-events-none`}
        >
          <div className="absolute inset-0.5 border border-slate-300 pointer-events-none" />
          {/* Subtle Corner Accents typical of authentic printed receipts */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current text-slate-900" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current text-slate-900" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current text-slate-900" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current text-slate-900" />
        </div>

        {/* Inner Content with padding to stay inside border */}
        <div className="relative z-10 px-2 py-1 flex-1 flex flex-col justify-between">
          {/* Section 1: Header (Judul KWITANSI & Nomor) */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-1">
            {/* Left: School Name & BOS mark */}
            <div className="flex-1 pr-2">
              <span className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wide block leading-none">
                {settings.namaSekolah}
              </span>
              <span className="text-[7.5px] text-slate-400 block pt-0.5">
                KAS PEMBAYARAN BKU BOS {settings.tahunAnggaran}
              </span>
            </div>

            {/* Center: Bold Title KWITANSI */}
            <div className="text-center px-2">
              <h1
                className={`font-serif font-black tracking-widest uppercase text-center ${
                  isMini ? 'text-sm' : 'text-base sm:text-lg'
                } ${theme.textAccentClass} leading-tight`}
              >
                KWITANSI
              </h1>
              <div className={`w-16 h-0.5 mx-auto mt-0.5 ${theme.bgAccentClass}`} />
            </div>

            {/* Right: Nomor Box */}
            <div className="flex-1 flex justify-end">
              <div className="border border-slate-400 px-2 py-0.5 bg-slate-50/80 rounded-xs flex items-center gap-1">
                <span className="text-[8px] font-bold text-slate-500 uppercase">No:</span>
                <span className="text-[10px] sm:text-xs font-mono font-extrabold text-black">
                  {transaction.bkuNo || bkuNumeric}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Form Lines (Telah diterima dari, Terbilang, Untuk Pembayaran) */}
          <div className="space-y-1 sm:space-y-1.5 pt-1 text-[9.5px] sm:text-[10.5px]">
            {/* Row 1: Telah Diterima Dari */}
            <div className="grid grid-cols-12 gap-1 items-baseline">
              <span className="col-span-3 sm:col-span-3 font-semibold text-slate-700 whitespace-nowrap">
                Telah Diterima Dari
              </span>
              <span className="col-span-1 text-center font-bold text-slate-600">:</span>
              <span className="col-span-8 font-bold text-slate-900 truncate">
                Bendahara BOS {settings.namaSekolah}
              </span>
            </div>

            {/* Row 2: Uang Sejumlah (Box Terbilang khas Kwitansi) */}
            <div className="grid grid-cols-12 gap-1 items-center">
              <span className="col-span-3 sm:col-span-3 font-semibold text-slate-700 whitespace-nowrap">
                Uang Sejumlah
              </span>
              <span className="col-span-1 text-center font-bold text-slate-600">:</span>
              <div className="col-span-8">
                <div
                  className={`border border-slate-300 px-2.5 py-1 rounded-xs bg-[#F4F4F4] text-slate-900 font-serif italic font-bold leading-tight ${
                    isMini ? 'text-[8.5px]' : 'text-[10px] sm:text-xs'
                  }`}
                >
                  ## {terbilang(nominal)} ##
                </div>
              </div>
            </div>

            {/* Row 3: Untuk Pembayaran */}
            <div className="grid grid-cols-12 gap-1 items-baseline">
              <span className="col-span-3 sm:col-span-3 font-semibold text-slate-700 whitespace-nowrap">
                Untuk Pembayaran
              </span>
              <span className="col-span-1 text-center font-bold text-slate-600">:</span>
              <div className="col-span-8 space-y-0.5">
                <p className="font-semibold text-black leading-snug line-clamp-1">
                  {transaction.uraian}
                </p>
                {transaction.kodeRekening && !isMini && (
                  <p className="text-[7.5px] text-slate-500 font-mono line-clamp-1">
                    Rek: {transaction.kodeRekening}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Bottom Section (Nominal Rp + Materai + Signatures) */}
          <div className="pt-1.5 flex items-end justify-between gap-2">
            {/* Left: Kotak Jumlah Terbilang Angka Rp */}
            <div className="shrink-0 flex flex-col justify-end">
              <div className="border-t-2 border-b-2 border-black py-1 px-3 bg-slate-100/90 text-center font-mono shadow-xs">
                <span className="text-[8px] font-sans font-bold text-slate-600 block leading-none pb-0.5 text-left">
                  Terbilang :
                </span>
                <span
                  className={`font-black text-black tracking-tight ${
                    isMini ? 'text-xs' : 'text-sm sm:text-base'
                  }`}
                >
                  {formatRupiah(nominal)}
                </span>
              </div>
            </div>

            {/* Center: Kotak Bea Materai (opsional / otomatis >= 5 jt) */}
            {showMaterai && (
              <div className="shrink-0 flex flex-col items-center justify-center border border-dashed border-slate-400 bg-slate-50 text-slate-500 w-16 h-12 rounded text-center px-1">
                <span className="text-[6.5px] uppercase font-bold tracking-tight text-slate-400 block">
                  TEMPAT
                </span>
                <span className="text-[7.5px] font-extrabold text-slate-700 block leading-tight">
                  MATERAI
                </span>
                <span className="text-[6.5px] text-slate-600 font-mono">Rp 10.000</span>
              </div>
            )}

            {/* Right: Date & 3 Signatures */}
            <div className="flex-1 max-w-[62%] text-[8px] sm:text-[9px] text-slate-900">
              {/* Date line */}
              <div className="text-right font-medium text-slate-700 pb-1 pr-1 text-[8px] sm:text-[8.5px]">
                {settings.kotaKabupaten || settings.kecamatan},{' '}
                {formatTanggalIndo(transaction.tanggal)}
              </div>

              {/* 3 Columns of Signatures */}
              <div className="grid grid-cols-3 gap-1 text-center items-end">
                {/* 1. Kepala Sekolah */}
                <div className="flex flex-col justify-between h-14 sm:h-16">
                  <span className="font-semibold text-slate-700 leading-none">
                    Mengetahui,
                    <br />
                    <span className="text-[7px] text-slate-500">Kepala Sekolah</span>
                  </span>
                  <div>
                    <span className="font-bold underline block truncate text-[8px] sm:text-[8.5px]">
                      {settings.namaKepalaSekolah}
                    </span>
                    <span className="text-[6.5px] text-slate-500 block truncate">
                      NIP. {settings.nipKepalaSekolah || '-'}
                    </span>
                  </div>
                </div>

                {/* 2. Bendahara */}
                <div className="flex flex-col justify-between h-14 sm:h-16">
                  <span className="font-semibold text-slate-700 leading-none">
                    Lunas Bayar,
                    <br />
                    <span className="text-[7px] text-slate-500">Bendahara</span>
                  </span>
                  <div>
                    <span className="font-bold underline block truncate text-[8px] sm:text-[8.5px]">
                      {settings.namaBendahara}
                    </span>
                    <span className="text-[6.5px] text-slate-500 block truncate">
                      NIP. {settings.nipBendahara || '-'}
                    </span>
                  </div>
                </div>

                {/* 3. Penerima */}
                <div className="flex flex-col justify-between h-14 sm:h-16">
                  <span className="font-semibold text-slate-700 leading-none">
                    Yang Menerima,
                    <br />
                    <span className="text-[7px] text-transparent select-none">-</span>
                  </span>
                  <div>
                    <span className="font-bold underline block truncate text-[8px] sm:text-[8.5px]">
                      {transaction.penerima || 'Penerima'}
                    </span>
                    <span className="text-[6.5px] text-transparent block select-none">
                      -
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
