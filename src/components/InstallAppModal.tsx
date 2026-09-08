import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Laptop,
  Download,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Monitor,
  Chrome,
  Compass,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'chrome' | 'edge' | 'offline'>('chrome');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#107C41] to-[#0A5C2F] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 shadow-xs">
              <Laptop className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Pasang Aplikasi di Laptop</h3>
              <p className="text-xs text-emerald-100">
                Jalankan seperti aplikasi desktop mandiri tanpa address bar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1.5 rounded-full hover:bg-emerald-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Action Button if browser supports prompt */}
          {isInstallable && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Laptop Anda Siap Pasang Langsung
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Klik tombol di samping untuk langsung menambahkan aplikasi ke Desktop & Start Menu.
                </p>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto bg-[#107C41] hover:bg-[#0B6132] text-white font-black text-sm px-5 py-2.5 rounded-lg shadow-md flex items-center justify-center gap-2 uppercase tracking-wide transition active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                Pasang Sekarang
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-blue-900 text-xs font-medium">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>Aplikasi ini sudah terpasang di perangkat Anda dan dapat dibuka melalui Desktop atau Taskbar.</span>
            </div>
          )}

          {/* Tab Selector for Browser Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pilih Panduan Sesuai Browser di Laptop Anda:
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('chrome')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  activeTab === 'chrome'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Chrome className="w-4 h-4 text-amber-500" />
                Google Chrome
              </button>
              <button
                onClick={() => setActiveTab('edge')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  activeTab === 'edge'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4 text-blue-500" />
                Microsoft Edge
              </button>
              <button
                onClick={() => setActiveTab('offline')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                  activeTab === 'offline'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-500" />
                Kelebihan PWA
              </button>
            </div>
          </div>

          {/* Chrome Instructions */}
          {activeTab === 'chrome' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Buka aplikasi di Google Chrome</p>
                  <p className="text-slate-500 mt-0.5">
                    Pastikan Anda membuka URL link aplikasi (atau klik tombol buka di tab baru jika Anda berada di dalam tampilan preview).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Lihat Bilah Alamat (Address Bar) di Kanan Atas</p>
                  <p className="text-slate-500 mt-0.5">
                    Akan muncul ikon <strong>monitor komputer dengan tanda panah ke bawah</strong> atau teks <strong>"Install Aplikasi BKU & Kwitansi"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Atau gunakan Menu Titik Tiga (⋮)</p>
                  <p className="text-slate-500 mt-0.5">
                    Klik menu <strong>⋮ (di pojok kanan atas Chrome)</strong> &rarr; pilih <strong>"Simpan dan bagikan" (Save and share)</strong> &rarr; klik <strong>"Pasang halaman ini sebagai aplikasi..." (Install page as app)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Selesai!</p>
                  <p className="text-slate-500 mt-0.5">
                    Ikon aplikasi langsung muncul di Desktop & Taskbar laptop Anda dan dapat dibuka kapan saja dengan sekali klik.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Edge Instructions */}
          {activeTab === 'edge' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Buka aplikasi di Microsoft Edge</p>
                  <p className="text-slate-500 mt-0.5">
                    Edge adalah browser bawaan laptop Windows 10/11 yang sangat optimal untuk aplikasi ini.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Ikon Aplikasi Tersedia di Address Bar</p>
                  <p className="text-slate-500 mt-0.5">
                    Di ujung kanan kolom alamat web (URL), klik ikon <strong>tiga kotak dengan tanda tambah (+)</strong> bertuliskan <em>"App available. Install BKU Sekolah"</em>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Atau lewat Menu Titik Tiga (...)</p>
                  <p className="text-slate-500 mt-0.5">
                    Klik <strong>... (Pengaturan dan lainnya)</strong> &rarr; pilih <strong>Aplikasi (Apps)</strong> &rarr; klik <strong>"Pasang situs ini sebagai aplikasi" (Install this site as an app)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Centang Sematkan ke Taskbar</p>
                  <p className="text-slate-500 mt-0.5">
                    Centang pilihan "Sematkan ke taskbar" dan "Buat pintasan desktop", lalu klik <strong>Izinkan (Allow)</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Advantages of PWA */}
          {activeTab === 'offline' && (
            <div className="space-y-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-xs text-slate-700">
              <h5 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-600" />
                Keuntungan Memasang di Laptop:
              </h5>
              <ul className="space-y-2 list-disc pl-4 text-slate-600">
                <li>
                  <strong className="text-slate-900">Bekerja seperti Software Desktop:</strong> Membuka dalam jendela mandiri yang bersih tanpa tab atau address bar browser yang mengganggu.
                </li>
                <li>
                  <strong className="text-slate-900">Data Tersimpan Otomatis:</strong> Data transaksi BKU dan profil sekolah Anda tersimpan aman di penyimpanan laptop Anda.
                </li>
                <li>
                  <strong className="text-slate-900">Bisa Diakses Cepat:</strong> Cukup klik dua kali ikon di Desktop laptop Anda kapan saja saat Anda ingin membukukan kas.
                </li>
                <li>
                  <strong className="text-slate-900">Tetap Bisa Ekspor/Impor Excel:</strong> Fitur unduh dan impor file Excel (.xlsx) tetap berjalan penuh 100%.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Format: Progressive Web App (PWA) Standalone
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-xs"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
