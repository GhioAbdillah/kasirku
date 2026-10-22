import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { formatRupiah } from '../utils/formatters';
import { X, QrCode, Search, Check, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose }) => {
  const { products, addToCart } = usePOS();
  const [skuInput, setSkuInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSku = skuInput.trim().toUpperCase();
    if (!cleanSku) return;

    const matchedProduct = products.find(
      (p) => p.sku.toUpperCase() === cleanSku || p.id.toUpperCase() === cleanSku
    );

    if (matchedProduct) {
      const success = addToCart(matchedProduct, 1);
      if (success) {
        setScanMessage({
          type: 'success',
          text: `Berhasil menambahkan: ${matchedProduct.name}`,
        });
        setSkuInput('');
      } else {
        setScanMessage({
          type: 'error',
          text: `Stok produk ${matchedProduct.name} tidak mencukupi!`,
        });
      }
    } else {
      setScanMessage({
        type: 'error',
        text: `Barcode / SKU "${cleanSku}" tidak ditemukan di sistem.`,
      });
    }

    setTimeout(() => {
      setScanMessage(null);
    }, 2500);
  };

  const handleQuickTapSku = (sku: string) => {
    setSkuInput(sku);
    const matchedProduct = products.find((p) => p.sku === sku);
    if (matchedProduct) {
      addToCart(matchedProduct, 1);
      setScanMessage({
        type: 'success',
        text: `Berhasil scan: ${matchedProduct.name}`,
      });
      setTimeout(() => setScanMessage(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-slate-800" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Scanner Barcode / SKU</h3>
              <p className="text-xs text-slate-500">Scan scanner fisik atau ketik manual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleScanSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Input SKU / Barcode Produk:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  placeholder="Contoh: MNM-001 atau MKN-001..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Scan Enter
              </button>
            </div>
          </form>

          {/* Alert feedback */}
          {scanMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {scanMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{scanMessage.text}</span>
            </div>
          )}

          {/* Quick SKU simulation presets from real products */}
          <div>
            <div className="text-xs text-slate-500 font-medium mb-2">
              Simulasi Cepat (Klik SKU produk di bawah):
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickTapSku(p.sku)}
                  className="p-2.5 text-left border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div className="font-mono text-xs font-bold text-slate-900">
                    {p.sku}
                  </div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    {formatRupiah(p.price)} · Stok {p.stock}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
