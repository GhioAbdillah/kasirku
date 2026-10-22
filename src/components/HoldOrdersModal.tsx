import React from 'react';
import { usePOS } from '../context/POSContext';
import { formatRupiah, formatIndoDate } from '../utils/formatters';
import { X, PlayCircle, Trash2, PauseCircle, Clock } from 'lucide-react';

interface HoldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HoldOrdersModal: React.FC<HoldOrdersModalProps> = ({ isOpen, onClose }) => {
  const { heldOrders, restoreHeldOrder, deleteHeldOrder, setActiveTab } = usePOS();

  if (!isOpen) return null;

  const handleRestore = (id: string) => {
    restoreHeldOrder(id);
    setActiveTab('register');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Pesanan Ditahan (Hold Bill)</h3>
              <p className="text-xs text-slate-500">
                {heldOrders.length} pesanan sementara tersimpan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Held Orders */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {heldOrders.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <PauseCircle className="w-10 h-10 stroke-[1.2] mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700 text-sm">Tidak Ada Pesanan Ditahan</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Gunakan tombol &apos;Hold&apos; di kasir jika pelanggan ingin menunda pembayaran atau memesan tambahan nanti.
              </p>
            </div>
          ) : (
            heldOrders.map((hold) => {
              const totalItems = hold.items.reduce((acc, i) => acc + i.quantity, 0);
              const totalAmount = hold.items.reduce((acc, i) => {
                const disc = (i.discountPercent || 0) / 100;
                return acc + i.product.price * (1 - disc) * i.quantity;
              }, 0);

              return (
                <div
                  key={hold.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {hold.name || 'Pesanan'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatIndoDate(hold.timestamp)}
                        </span>
                        {hold.tableNumber && <span>· Meja #{hold.tableNumber}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900 font-mono text-sm">
                        {formatRupiah(totalAmount)}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {totalItems} item
                      </div>
                    </div>
                  </div>

                  {/* Summary of items */}
                  <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 space-y-1">
                    {hold.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate pr-2">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-mono text-slate-500">
                          {formatRupiah(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {hold.items.length > 3 && (
                      <div className="text-[11px] text-slate-400 italic">
                        +{hold.items.length - 3} item lainnya...
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => deleteHeldOrder(hold.id)}
                      className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRestore(hold.id)}
                      className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Buka di Kasir</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
