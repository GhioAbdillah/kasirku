import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { StoreSettings } from '../types';
import { sounds } from '../utils/audio';
import {
  Save,
  RotateCcw,
  Volume2,
  Receipt,
  Percent,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToSampleData } = usePOS();
  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setIsSaved(true);
    if (form.soundEnabled) {
      sounds.playSuccess();
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestSound = () => {
    sounds.playBeep();
    setTimeout(() => sounds.playSuccess(), 250);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengatur ulang data ke sampel bawaan? Seluruh riwayat transaksi dan penyesuaian produk akan dikembalikan ke kondisi awal.'
      )
    ) {
      resetToSampleData();
      setForm({ ...settings });
      alert('Data kasir berhasil direset ke sampel awal.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-[1000px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengaturan Toko &amp; Kasir
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sesuaikan identitas toko, format struk belanja, pajak, dan preferensi kasir
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Profil &amp; Identitas Usaha
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Toko / Resto *
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Kasir Bertugas
              </label>
              <input
                type="text"
                value={form.cashierName}
                onChange={(e) => setForm({ ...form, cashierName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Alamat Toko (Tampil di Nota Struk)
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Tax & Service Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Percent className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Pajak &amp; Biaya Layanan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    Pajak Pertambahan Nilai (PPN)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dikenakan otomatis pada setiap pesanan
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.enableTax}
                  onChange={(e) => setForm({ ...form, enableTax: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              {form.enableTax && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">Tarif Pajak (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.taxRate}
                    onChange={(e) =>
                      setForm({ ...form, taxRate: Number(e.target.value) })
                    }
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded font-mono text-right"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    Biaya Layanan (Service Charge)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Biaya pelayanan resto atau cafe
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.enableService}
                  onChange={(e) =>
                    setForm({ ...form, enableService: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              {form.enableService && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">Tarif Layanan (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.serviceRate}
                    onChange={(e) =>
                      setForm({ ...form, serviceRate: Number(e.target.value) })
                    }
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded font-mono text-right"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Receipt & Audio Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Receipt className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Format Struk Belanja &amp; Audio Kasir
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Catatan Kaki Struk (Receipt Footer Note)
              </label>
              <textarea
                rows={3}
                value={form.receiptFooter}
                onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder="Pesan ucapan terima kasih atau ketentuan pengembalian..."
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-slate-700" />
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    Efek Suara Kasir (Audio Chime)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bunyi beep saat memindai barang &amp; lonceng pembayaran berhasil
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                >
                  Uji Coba Suara
                </button>
                <input
                  type="checkbox"
                  checked={form.soundEnabled}
                  onChange={(e) =>
                    setForm({ ...form, soundEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset ke Sampel Data Awal</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
