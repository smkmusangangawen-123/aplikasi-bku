export interface AppSettings {
  pemerintahan: string;
  tahunAnggaran: string;
  namaSekolah: string;
  kecamatan: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  namaBendahara: string;
  nipBendahara: string;
  subUnitOrganisasi?: string;
  kotaKabupaten: string;
}

export interface BkuTransaction {
  id: string;
  no: number;
  tanggal: string; // YYYY-MM-DD or DD/MM/YYYY
  program: string;
  prog: string;
  kegiatan: string;
  kegiatanNama?: string;
  kodeRekening: string;
  rekeningNama?: string;
  bkuNo: string; // e.g. BPU01, BPU22
  uraian: string;
  penerimaan: number;
  pengeluaran: number;
  saldo?: number;
  penerima: string;
  ppn: number;
  pph21: number;
  pph23: number;
  barangPersediaan: 'YA' | 'TIDAK';
  npwp?: string;
  alamat?: string;
  infoTambahan?: string;
}

export type ActiveTab = 'HOME' | 'INPUT BKU' | 'A2' | 'KWITANSI' | 'ANALISIS';
