import * as XLSX from 'xlsx';
import { AppSettings, BkuTransaction } from '../types';
import { terbilang, formatRupiah, formatTanggalIndo } from './formatters';

export function calculateTransactionsWithSaldo(
  transactions: BkuTransaction[]
): (BkuTransaction & { saldo: number })[] {
  let currentSaldo = 0;
  return transactions.map((tx) => {
    const penerimaan = Number(tx.penerimaan) || 0;
    const pengeluaran = Number(tx.pengeluaran) || 0;
    currentSaldo += penerimaan - pengeluaran;
    return {
      ...tx,
      saldo: currentSaldo,
    };
  });
}

export function exportToExcelFile(
  settings: AppSettings,
  transactions: BkuTransaction[],
  filename = 'Aplikasi_BKU_Kwitansi_BOS.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: HOME
  const homeData = [
    ['APLIKASI BKU & KWITANSI SEKOLAH', ''],
    ['Pemerintah Kabupaten/Kota', settings.pemerintahan],
    ['Tahun Anggaran', settings.tahunAnggaran],
    ['Nama Sekolah / Satuan Pendidikan', settings.namaSekolah],
    ['Kecamatan', settings.kecamatan],
    ['Kabupaten / Kota', settings.kotaKabupaten],
    ['Nama Kepala Sekolah', settings.namaKepalaSekolah],
    ['NIP Kepala Sekolah', settings.nipKepalaSekolah || '-'],
    ['Nama Bendahara', settings.namaBendahara],
    ['NIP Bendahara', settings.nipBendahara || '-'],
    ['Sub Unit Organisasi', settings.subUnitOrganisasi || '-'],
    ['', ''],
    ['Keterangan:', 'File ini kompatibel dengan Microsoft Excel dan Google Sheets.'],
  ];
  const wsHome = XLSX.utils.aoa_to_sheet(homeData);
  XLSX.utils.book_append_sheet(wb, wsHome, 'HOME');

  // 2. Sheet: INPUT BKU
  const calculatedTx = calculateTransactionsWithSaldo(transactions);
  const bkuHeaders = [
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
  ];

  const bkuRows = calculatedTx.map((t, idx) => [
    t.no || idx + 1,
    t.tanggal,
    t.program || '',
    t.prog || '',
    t.kegiatan || '',
    t.kodeRekening || '',
    t.bkuNo || '',
    t.uraian,
    t.penerimaan || 0,
    t.pengeluaran || 0,
    t.saldo,
    t.penerima || '',
    t.ppn || 0,
    t.pph21 || 0,
    t.pph23 || 0,
    t.barangPersediaan || 'TIDAK',
  ]);

  // Total summary row
  const totalPenerimaan = transactions.reduce((sum, t) => sum + (Number(t.penerimaan) || 0), 0);
  const totalPengeluaran = transactions.reduce((sum, t) => sum + (Number(t.pengeluaran) || 0), 0);
  const finalSaldo = totalPenerimaan - totalPengeluaran;
  const totalPPN = transactions.reduce((sum, t) => sum + (Number(t.ppn) || 0), 0);
  const totalPPH21 = transactions.reduce((sum, t) => sum + (Number(t.pph21) || 0), 0);
  const totalPPH23 = transactions.reduce((sum, t) => sum + (Number(t.pph23) || 0), 0);

  const totalRow = [
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    '',
    'JUMLAH TOTAL TRANSAKSI',
    totalPenerimaan,
    totalPengeluaran,
    finalSaldo,
    '',
    totalPPN,
    totalPPH21,
    totalPPH23,
    '',
  ];

  const wsBku = XLSX.utils.aoa_to_sheet([bkuHeaders, ...bkuRows, totalRow]);
  XLSX.utils.book_append_sheet(wb, wsBku, 'INPUT BKU');

  // 3. Sheet: REKAP & ANALISIS
  // Group by Program
  const programMap: Record<string, number> = {};
  // Group by Rekening
  const rekeningMap: Record<string, number> = {};

  transactions.forEach((tx) => {
    const amount = Number(tx.pengeluaran) || 0;
    if (amount > 0) {
      const prog = tx.program ? `Program ${tx.program}` : 'Lainnya / Umum';
      programMap[prog] = (programMap[prog] || 0) + amount;

      const rek = tx.kodeRekening || 'Tanpa Kode Rekening';
      rekeningMap[rek] = (rekeningMap[rek] || 0) + amount;
    }
  });

  const rekapData: (string | number)[][] = [
    ['RINGKASAN EKSEKUTIF KAS & BELANJA', ''],
    ['Total Penerimaan (Kas Masuk)', totalPenerimaan],
    ['Total Pengeluaran (Belanja)', totalPengeluaran],
    ['Sisa Saldo Kas', finalSaldo],
    ['Total Potongan Pajak PPN', totalPPN],
    ['Total Potongan Pajak PPH 21', totalPPH21],
    ['Total Potongan Pajak PPH 23', totalPPH23],
    ['', ''],
    ['REKAP BELANJA PER PROGRAM', 'TOTAL BELANJA (RP)'],
    ...Object.entries(programMap).map(([prog, amt]) => [prog, amt]),
    ['', ''],
    ['REKAP BELANJA PER KODE REKENING', 'TOTAL BELANJA (RP)'],
    ...Object.entries(rekeningMap).map(([rek, amt]) => [rek, amt]),
  ];

  const wsRekap = XLSX.utils.aoa_to_sheet(rekapData);
  XLSX.utils.book_append_sheet(wb, wsRekap, 'REKAP ANALISIS');

  // 4. Sheet: DAFTAR KWITANSI
  const kwitansiHeaders = [
    'NO BKU',
    'TANGGAL',
    'PENERIMA',
    'URAIAN',
    'JUMLAH (RP)',
    'TERBILANG',
    'KODE REKENING',
    'KEGIATAN',
  ];
  const kwitansiRows = transactions
    .filter((t) => (Number(t.pengeluaran) || 0) > 0)
    .map((t) => [
      t.bkuNo || `BPU-${t.no}`,
      t.tanggal,
      t.penerima,
      t.uraian,
      t.pengeluaran,
      terbilang(t.pengeluaran),
      t.kodeRekening,
      t.kegiatan,
    ]);

  const wsKwitansi = XLSX.utils.aoa_to_sheet([kwitansiHeaders, ...kwitansiRows]);
  XLSX.utils.book_append_sheet(wb, wsKwitansi, 'DAFTAR KWITANSI');

  // Auto column widths
  [wsHome, wsBku, wsRekap, wsKwitansi].forEach((ws) => {
    ws['!cols'] = [
      { wch: 10 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 45 },
      { wch: 12 },
      { wch: 35 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
    ];
  });

  // Write file
  XLSX.writeFile(wb, filename);
}

function formatExcelDate(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    const d = String(val.getDate()).padStart(2, '0');
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const y = val.getFullYear();
    return `${d}/${m}/${y}`;
  }
  if (typeof val === 'number' && val > 30000 && val < 60000) {
    // Excel date serial number
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    const d = String(date.getUTCDate()).padStart(2, '0');
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const y = date.getUTCFullYear();
    return `${d}/${m}/${y}`;
  }
  return String(val).trim();
}

export function exportBkuTemplateExcel(
  filename = 'Template_Input_BKU_Sekolah.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: INPUT BKU (Template)
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
    'PENERIMA',
    'PPN',
    'PPH21',
    'PPH23',
    'BARANG PERSEDIAAN',
  ];

  // 3 sample rows demonstrating correct format
  const sampleRows = [
    [
      1,
      '05/01/2026',
      '',
      '',
      '',
      '',
      '',
      'Penerimaan Saldo Awal / Dana BOS Tahap I',
      50000000,
      0,
      'Bendahara BOS',
      0,
      0,
      0,
      'TIDAK',
    ],
    [
      2,
      '12/01/2026',
      '03.',
      '03.03.',
      '03.03.16.',
      '5.1.02.01.01.0024 Belanja Alat Tulis Kantor',
      'BPU01',
      'Pembelian Kertas HVS A4 & Folio 75gr untuk KBM',
      0,
      1250000,
      'Toko Barokah ATK',
      0,
      0,
      0,
      'YA',
    ],
    [
      3,
      '20/01/2026',
      '07.',
      '07.02.',
      '07.02.01.',
      '5.1.02.02.01.0013 Belanja Jasa Tenaga Kependidikan',
      'BPU02',
      'Honorarium Tenaga Administrasi Bulan Januari',
      0,
      1800000,
      'Siti Rohmah, S.Pd',
      0,
      90000,
      0,
      'TIDAK',
    ],
  ];

  const wsBku = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  wsBku['!cols'] = [
    { wch: 8 },  // NO
    { wch: 14 }, // TANGGAL
    { wch: 12 }, // PROGRAM
    { wch: 12 }, // PROG
    { wch: 14 }, // KEGIATAN
    { wch: 45 }, // KODE REKENING
    { wch: 12 }, // BKU
    { wch: 45 }, // URAIAN
    { wch: 16 }, // PENERIMAAN
    { wch: 16 }, // PENGELUARAN
    { wch: 25 }, // PENERIMA
    { wch: 12 }, // PPN
    { wch: 12 }, // PPH21
    { wch: 12 }, // PPH23
    { wch: 20 }, // BARANG PERSEDIAAN
  ];
  XLSX.utils.book_append_sheet(wb, wsBku, 'INPUT BKU');

  // 2. Sheet: PETUNJUK PENGISIAN
  const instructions = [
    ['PANDUAN PENGISIAN TEMPLATE EXCEL INPUT BKU'],
    [''],
    ['KOLOM', 'PENJELASAN & CONTOH FORMAT'],
    ['NO', 'Nomor urut transaksi (1, 2, 3, dst)'],
    ['TANGGAL', 'Format DD/MM/YYYY atau tanggal Excel biasa (contoh: 25/02/2026)'],
    ['PROGRAM', 'Kode program SNP (contoh: 02., 03., 06., 07.)'],
    ['PROG', 'Kode sub-program (contoh: 03.03.)'],
    ['KEGIATAN', 'Kode kegiatan program (contoh: 03.03.16.)'],
    ['KODE REKENING', 'Kode & uraian rekening belanja (contoh: 5.1.02.01.01.0024 Belanja Alat Tulis Kantor)'],
    ['BKU', 'Nomor BPU / Kwitansi (contoh: BPU01, BPU02, kosongkan jika kas masuk)'],
    ['URAIAN', 'Uraian keperluan transaksi pembayaran atau kas masuk (Wajib diisi)'],
    ['PENERIMAAN', 'Jumlah uang masuk dalam rupiah (isi angka saja tanpa titik/Rp, atau 0 jika belanja)'],
    ['PENGELUARAN', 'Jumlah uang keluar / belanja dalam rupiah (isi angka saja tanpa titik/Rp, atau 0 jika kas masuk)'],
    ['PENERIMA', 'Nama toko rekanan atau nama penerima pembayaran honor / belanja'],
    ['PPN', 'Potongan pajak PPN dalam rupiah (isi angka 0 jika tidak ada)'],
    ['PPH21', 'Potongan pajak PPh 21 dalam rupiah (isi angka 0 jika tidak ada)'],
    ['PPH23', 'Potongan pajak PPh 23 dalam rupiah (isi angka 0 jika tidak ada)'],
    ['BARANG PERSEDIAAN', 'Isi "YA" jika merupakan belanja barang pakai habis/persediaan, atau "TIDAK"'],
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet(instructions);
  wsGuide['!cols'] = [{ wch: 20 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK PENGISIAN');

  XLSX.writeFile(wb, filename);
}

export function parseExcelFile(
  file: File,
  onSuccess: (transactions: BkuTransaction[]) => void,
  onError: (err: string) => void
) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });

      // Look for sheet named "INPUT BKU" or similar, otherwise first sheet
      const sheetName =
        workbook.SheetNames.find(
          (name) =>
            name.toUpperCase().includes('BKU') ||
            name.toUpperCase().includes('INPUT') ||
            name.toUpperCase().includes('DATA')
        ) || workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        throw new Error('Lembar kerja (sheet) tidak ditemukan dalam file Excel.');
      }

      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
      if (!rows || rows.length < 2) {
        throw new Error('Data Excel kosong atau tidak memiliki baris data.');
      }

      // Find header row (contains TANGGAL or URAIAN or PENERIMAAN)
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const rowText = (rows[i] || []).map((c) => String(c).toUpperCase()).join(' ');
        if (
          rowText.includes('TANGGAL') ||
          rowText.includes('URAIAN') ||
          rowText.includes('PENERIMAAN') ||
          rowText.includes('BKU')
        ) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = (rows[headerRowIndex] || []).map((h) =>
        String(h || '').trim().toUpperCase()
      );

      // Find index mapping
      const getColIdx = (...keywords: string[]) => {
        return headers.findIndex((h) => keywords.some((k) => h.includes(k)));
      };

      const noIdx = getColIdx('NO');
      const tglIdx = getColIdx('TANGGAL', 'TGL', 'DATE');
      const progCodeIdx = getColIdx('PROGRAM');
      const subProgIdx = getColIdx('PROG');
      const kegIdx = getColIdx('KEGIATAN');
      const rekIdx = getColIdx('REKENING', 'KODE REK');
      const bkuIdx = getColIdx('BKU');
      const uraianIdx = getColIdx('URAIAN', 'KETERANGAN', 'DESKRIPSI');
      const masukIdx = getColIdx('PENERIMAAN', 'DEBIT', 'MASUK');
      const keluarIdx = getColIdx('PENGELUARAN', 'KREDIT', 'KELUAR');
      const penerimaIdx = getColIdx('PENERIMA', 'DIBAYAR KEPADA', 'REKANAN');
      const ppnIdx = getColIdx('PPN');
      const pph21Idx = getColIdx('PPH21', 'PPH 21');
      const pph23Idx = getColIdx('PPH23', 'PPH 23');
      const persediaanIdx = getColIdx('PERSEDIAAN', 'BARANG');

      const parsedList: BkuTransaction[] = [];

      for (let r = headerRowIndex + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        const uraian = uraianIdx >= 0 ? String(row[uraianIdx] || '').trim() : '';
        const rawTgl = tglIdx >= 0 ? row[tglIdx] : '';
        const tanggal = formatExcelDate(rawTgl);

        // Ignore summary total row
        if (
          uraian.toUpperCase().includes('TOTAL') ||
          uraian.toUpperCase().includes('JUMLAH') ||
          (!uraian && !tanggal)
        ) {
          continue;
        }

        const parseNum = (val: any) => {
          if (typeof val === 'number') return val;
          if (!val) return 0;
          const clean = String(val).replace(/[^0-9.-]/g, '');
          const n = parseFloat(clean);
          return isNaN(n) ? 0 : n;
        };

        const penerimaan = masukIdx >= 0 ? parseNum(row[masukIdx]) : 0;
        const pengeluaran = keluarIdx >= 0 ? parseNum(row[keluarIdx]) : 0;

        if (!uraian && penerimaan === 0 && pengeluaran === 0) continue;

        parsedList.push({
          id: `bku-import-${r}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          no: noIdx >= 0 && row[noIdx] ? Number(row[noIdx]) : parsedList.length + 1,
          tanggal: tanggal || new Date().toISOString().slice(0, 10),
          program: progCodeIdx >= 0 ? String(row[progCodeIdx] || '').trim() : '',
          prog: subProgIdx >= 0 ? String(row[subProgIdx] || '').trim() : '',
          kegiatan: kegIdx >= 0 ? String(row[kegIdx] || '').trim() : '',
          kodeRekening: rekIdx >= 0 ? String(row[rekIdx] || '').trim() : '',
          bkuNo: bkuIdx >= 0 ? String(row[bkuIdx] || '').trim() : '',
          uraian: uraian || 'Belanja',
          penerimaan,
          pengeluaran,
          penerima: penerimaIdx >= 0 ? String(row[penerimaIdx] || '').trim() : '-',
          ppn: ppnIdx >= 0 ? parseNum(row[ppnIdx]) : 0,
          pph21: pph21Idx >= 0 ? parseNum(row[pph21Idx]) : 0,
          pph23: pph23Idx >= 0 ? parseNum(row[pph23Idx]) : 0,
          barangPersediaan:
            persediaanIdx >= 0 && String(row[persediaanIdx]).toUpperCase().includes('YA')
              ? 'YA'
              : 'TIDAK',
        });
      }

      if (parsedList.length === 0) {
        throw new Error('Tidak ada baris transaksi yang berhasil dibaca dari file Excel.');
      }

      onSuccess(parsedList);
    } catch (err: any) {
      onError(err.message || 'Gagal memproses file Excel.');
    }
  };

  reader.onerror = () => {
    onError('Gagal membaca file dari komputer Anda.');
  };

  reader.readAsArrayBuffer(file);
}
