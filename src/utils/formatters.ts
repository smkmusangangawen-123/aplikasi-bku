/**
 * Indonesian Number to Words (Terbilang) & Formatting Utilities
 */

const satuan = [
  '',
  'Satu',
  'Dua',
  'Tiga',
  'Empat',
  'Lima',
  'Enam',
  'Tujuh',
  'Delapan',
  'Sembilan',
  'Sepuluh',
  'Sebelas',
];

export function terbilang(n: number): string {
  const num = Math.floor(Math.abs(n));
  if (num === 0) return 'Nol';

  function bilang(x: number): string {
    if (x < 12) {
      return satuan[x];
    } else if (x < 20) {
      return bilang(x - 10) + ' Belas';
    } else if (x < 100) {
      return bilang(Math.floor(x / 10)) + ' Puluh' + (x % 10 > 0 ? ' ' + bilang(x % 10) : '');
    } else if (x < 200) {
      return 'Seratus' + (x - 100 > 0 ? ' ' + bilang(x - 100) : '');
    } else if (x < 1000) {
      return bilang(Math.floor(x / 100)) + ' Ratus' + (x % 100 > 0 ? ' ' + bilang(x % 100) : '');
    } else if (x < 2000) {
      return 'Seribu' + (x - 1000 > 0 ? ' ' + bilang(x - 1000) : '');
    } else if (x < 1000000) {
      return bilang(Math.floor(x / 1000)) + ' Ribu' + (x % 1000 > 0 ? ' ' + bilang(x % 1000) : '');
    } else if (x < 1000000000) {
      return bilang(Math.floor(x / 1000000)) + ' Juta' + (x % 1000000 > 0 ? ' ' + bilang(x % 1000000) : '');
    } else if (x < 1000000000000) {
      return bilang(Math.floor(x / 1000000000)) + ' Miliar' + (x % 1000000000 > 0 ? ' ' + bilang(x % 1000000000) : '');
    } else if (x < 1000000000000000) {
      return bilang(Math.floor(x / 1000000000000)) + ' Triliun' + (x % 1000000000000 > 0 ? ' ' + bilang(x % 1000000000000) : '');
    }
    return '';
  }

  const result = bilang(num).trim();
  return result ? `${result} Rupiah` : 'Nol Rupiah';
}

export function formatRupiah(amount: number | undefined | null, withPrefix = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return withPrefix ? 'Rp 0' : '0';
  }
  const formatted = Math.round(amount).toLocaleString('id-ID');
  return withPrefix ? `Rp ${formatted}` : formatted;
}

export function parseRupiahInput(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Remove non-digits except minus
  const clean = value.replace(/[^0-9-]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '';
  
  // If already formatted like "25 Februari 2026"
  if (/[a-zA-Z]/.test(dateStr)) return dateStr;

  // If in DD/MM/YYYY
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10);
    const year = slashMatch[3];
    const namaBulan = [
      '',
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return `${day} ${namaBulan[month] || month} ${year}`;
  }

  // If in YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    const namaBulan = [
      '',
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return `${day} ${namaBulan[month] || month} ${year}`;
  }

  return dateStr;
}
