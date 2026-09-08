import React, { useState, useEffect } from 'react';
import { BkuTransaction } from '../types';
import { commonKodeRekeningList } from '../data/initialData';
import { X, Save } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: BkuTransaction) => void;
  transactionToEdit?: BkuTransaction | null;
  nextNo: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
  nextNo,
}) => {
  const [formData, setFormData] = useState<Partial<BkuTransaction>>({
    no: nextNo,
    tanggal: new Date().toISOString().slice(0, 10),
    program: '',
    prog: '',
    kegiatan: '',
    kodeRekening: '',
    bkuNo: '',
    uraian: '',
    penerimaan: 0,
    pengeluaran: 0,
    penerima: '',
    ppn: 0,
    pph21: 0,
    pph23: 0,
    barangPersediaan: 'TIDAK',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (transactionToEdit) {
      setFormData(transactionToEdit);
    } else {
      setFormData({
        no: nextNo,
        tanggal: new Date().toLocaleDateString('id-ID'),
        program: '03.',
        prog: '03.03.',
        kegiatan: '03.03.16.',
        kodeRekening: commonKodeRekeningList[0],
        bkuNo: `BPU${String(nextNo).padStart(2, '0')}`,
        uraian: '',
        penerimaan: 0,
        pengeluaran: 0,
        penerima: '',
        ppn: 0,
        pph21: 0,
        pph23: 0,
        barangPersediaan: 'TIDAK',
      });
    }
  }, [transactionToEdit, nextNo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.uraian?.trim()) {
      setErrorMsg('Mohon masukkan uraian transaksi / keperluan pembayaran.');
      return;
    }

    const savedTx: BkuTransaction = {
      id: formData.id || `bku-custom-${Date.now()}`,
      no: Number(formData.no) || nextNo,
      tanggal: formData.tanggal || new Date().toLocaleDateString('id-ID'),
      program: formData.program || '',
      prog: formData.prog || '',
      kegiatan: formData.kegiatan || '',
      kodeRekening: formData.kodeRekening || '',
      bkuNo: formData.bkuNo || '',
      uraian: formData.uraian || '',
      penerimaan: Number(formData.penerimaan) || 0,
      pengeluaran: Number(formData.pengeluaran) || 0,
      penerima: formData.penerima || '-',
      ppn: Number(formData.ppn) || 0,
      pph21: Number(formData.pph21) || 0,
      pph23: Number(formData.pph23) || 0,
      barangPersediaan: formData.barangPersediaan || 'TIDAK',
      npwp: formData.npwp || '',
      alamat: formData.alamat || '',
      infoTambahan: formData.infoTambahan || '',
    };

    onSave(savedTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8 overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="bg-[#41B6E6] text-black px-6 py-4 flex items-center justify-between border-b border-sky-400">
          <div>
            <h3 className="font-bold text-lg">
              {transactionToEdit ? 'Edit Transaksi BKU' : 'Tambah Transaksi BKU Baru'}
            </h3>
            <p className="text-xs text-slate-800">
              Formulir pencatatan kas umum, bukti verifikasi A2, dan kwitansi
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-800 hover:text-black p-1.5 rounded-full hover:bg-sky-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-red-500 hover:text-red-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. Urut</label>
              <input
                type="number"
                value={formData.no || nextNo}
                onChange={(e) => setFormData({ ...formData, no: parseInt(e.target.value, 10) })}
                className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal (DD/MM/YYYY)
              </label>
              <input
                type="text"
                value={formData.tanggal || ''}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                placeholder="25/02/2026"
                className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. BKU / BPU (Kwitansi)
              </label>
              <input
                type="text"
                value={formData.bkuNo || ''}
                onChange={(e) => setFormData({ ...formData, bkuNo: e.target.value })}
                placeholder="BPU22"
                className="w-full border border-slate-300 rounded px-3 py-1.5 font-bold uppercase focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Program</label>
              <input
                type="text"
                value={formData.program || ''}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="03."
                className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sub Program (Prog)</label>
              <input
                type="text"
                value={formData.prog || ''}
                onChange={(e) => setFormData({ ...formData, prog: e.target.value })}
                placeholder="03.05."
                className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kegiatan</label>
              <input
                type="text"
                value={formData.kegiatan || ''}
                onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
                placeholder="03.05.02."
                className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Kode Rekening */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kode Rekening & Uraian Rekening
            </label>
            <input
              type="text"
              list="kode-rekening-list"
              value={formData.kodeRekening || ''}
              onChange={(e) => setFormData({ ...formData, kodeRekening: e.target.value })}
              placeholder="5.1.02.01.01.0037 Belanja Obat-Obat-Obatan"
              className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-500"
            />
            <datalist id="kode-rekening-list">
              {commonKodeRekeningList.map((item, i) => (
                <option key={i} value={item} />
              ))}
            </datalist>
          </div>

          {/* Uraian Transaksi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Uraian / Keperluan Pembayaran <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.uraian || ''}
              onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
              placeholder="Contoh: Betadin, obat suplemen lainnya atau Pembayaran daya listrik..."
              className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-500"
              required
            />
          </div>

          {/* Nominal Penerimaan & Pengeluaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                Penerimaan (Kas Masuk / Debit) Rp
              </label>
              <input
                type="number"
                value={formData.penerimaan ?? 0}
                onChange={(e) => setFormData({ ...formData, penerimaan: parseFloat(e.target.value) || 0 })}
                className="w-full border border-emerald-300 rounded px-3 py-1.5 font-semibold text-emerald-900 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-red-800 mb-1">
                Pengeluaran (Belanja / Kredit) Rp
              </label>
              <input
                type="number"
                value={formData.pengeluaran ?? 0}
                onChange={(e) => setFormData({ ...formData, pengeluaran: parseFloat(e.target.value) || 0 })}
                className="w-full border border-red-300 rounded px-3 py-1.5 font-semibold text-red-900 focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Penerima & Pajak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Penerima / Rekanan Toko / Guru
              </label>
              <input
                type="text"
                value={formData.penerima || ''}
                onChange={(e) => setFormData({ ...formData, penerima: e.target.value })}
                placeholder="Apotek Enggal Waras / Anugerah Ilmu"
                className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Barang Persediaan
              </label>
              <select
                value={formData.barangPersediaan || 'TIDAK'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    barangPersediaan: e.target.value as 'YA' | 'TIDAK',
                  })
                }
                className="w-full border border-slate-300 rounded px-3 py-1.5 focus:ring-1 focus:ring-sky-500"
              >
                <option value="TIDAK">TIDAK</option>
                <option value="YA">YA</option>
              </select>
            </div>
          </div>

          {/* Pajak Potongan */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PPN (Rp)</label>
              <input
                type="number"
                value={formData.ppn ?? 0}
                onChange={(e) => setFormData({ ...formData, ppn: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PPh 21 (Rp)</label>
              <input
                type="number"
                value={formData.pph21 ?? 0}
                onChange={(e) => setFormData({ ...formData, pph21: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PPh 23 (Rp)</label>
              <input
                type="number"
                value={formData.pph23 ?? 0}
                onChange={(e) => setFormData({ ...formData, pph23: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded px-3 py-1.5"
              />
            </div>
          </div>

          {/* Detail Rekanan Tambahan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                NPWP Penerima (Opsional)
              </label>
              <input
                type="text"
                value={formData.npwp || ''}
                onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                placeholder="-"
                className="w-full border border-slate-300 rounded px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Alamat Penerima (Opsional)
              </label>
              <input
                type="text"
                value={formData.alamat || ''}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Kec. Ngawen, Kab. Blora"
                className="w-full border border-slate-300 rounded px-3 py-1.5"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-1.5 shadow transition"
            >
              <Save className="w-4 h-4" />
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
