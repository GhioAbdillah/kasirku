import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { formatRupiah } from '../utils/formatters';
import {
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  Percent,
  PauseCircle,
  CreditCard,
  UtensilsCrossed,
  ShoppingBag,
  User,
  Hash,
} from 'lucide-react';

interface CartSidebarProps {
  onOpenPayment: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ onOpenPayment }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    customerName,
    setCustomerName,
    tableNumber,
    setTableNumber,
    orderType,
    setOrderType,
    cartDiscount,
    setCartDiscount,
    updateCartItemNote,
    updateCartItemDiscount,
    holdCurrentOrder,
    cartSubtotal,
    cartDiscountTotal,
    cartTaxAmount,
    cartServiceAmount,
    cartGrandTotal,
    settings,
  } = usePOS();

  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);
  const [activeDiscountItemId, setActiveDiscountItemId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [tempDisc, setTempDisc] = useState('0');
  const [showGlobalDiscountInput, setShowGlobalDiscountInput] = useState(false);

  const handleOpenNote = (id: string, currentNote?: string) => {
    setActiveNoteItemId(id);
    setTempNote(currentNote || '');
  };

  const handleSaveNote = (id: string) => {
    updateCartItemNote(id, tempNote.trim());
    setActiveNoteItemId(null);
  };

  const handleOpenItemDiscount = (id: string, currentDisc?: number) => {
    setActiveDiscountItemId(id);
    setTempDisc(String(currentDisc || 0));
  };

  const handleSaveItemDiscount = (id: string) => {
    const val = parseFloat(tempDisc) || 0;
    updateCartItemDiscount(id, val);
    setActiveDiscountItemId(null);
  };

  const isCartEmpty = cart.length === 0;

  return (
    <div className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-xs">
      {/* Header: Order Type & Customer Details */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
            <span>Daftar Pesanan</span>
            {cart.length > 0 && (
              <span className="text-xs font-normal text-slate-500">
                ({cart.reduce((a, b) => a + b.quantity, 0)} item)
              </span>
            )}
          </h2>

          {!isCartEmpty && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => holdCurrentOrder()}
                className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 px-2 py-1 bg-amber-50 rounded hover:bg-amber-100 transition-colors"
                title="Simpan pesanan sementara untuk melayani pelanggan lain"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                Hold
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2 py-1 bg-rose-50 rounded hover:bg-rose-100 transition-colors"
                title="Hapus semua pesanan di keranjang"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Order Type Toggle: Dine In vs Take Away */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-lg">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
              orderType === 'dine_in'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Makan di Tempat</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('take_away')}
            className={`flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${
              orderType === 'take_away'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bawa Pulang</span>
          </button>
        </div>

        {/* Customer Name & Table Number */}
        <div className="grid grid-cols-5 gap-2">
          <div className="relative col-span-3">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama Pelanggan (opsional)"
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
          <div className="relative col-span-2">
            <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder={orderType === 'dine_in' ? 'No Meja' : 'No Antrean'}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isCartEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingBag className="w-12 h-12 stroke-[1.2] mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">Keranjang Masih Kosong</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Pilih menu dari katalog di sebelah kiri untuk memulai pesanan.
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const hasDisc = (item.discountPercent || 0) > 0;
            const unitPriceAfterDisc = item.product.price * (1 - (item.discountPercent || 0) / 100);
            const itemTotal = unitPriceAfterDisc * item.quantity;

            return (
              <div
                key={item.product.id}
                className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
              >
                {/* Top Row: Name and Total */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-xs text-slate-900 leading-snug">
                      {item.product.name}
                    </h5>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatRupiah(item.product.price)}
                      {hasDisc && (
                        <span className="ml-1 text-emerald-600 font-semibold">
                          (Diskon {item.discountPercent}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="font-bold text-slate-900 font-mono text-xs whitespace-nowrap">
                    {formatRupiah(itemTotal)}
                  </div>
                </div>

                {/* Note display if exists */}
                {item.note && (
                  <div className="text-[11px] text-slate-600 italic bg-amber-50/70 border border-amber-200/60 rounded px-2 py-0.5">
                    Catatan: {item.note}
                  </div>
                )}

                {/* Note Editor Inline */}
                {activeNoteItemId === item.product.id && (
                  <div className="flex items-center gap-1 pt-1">
                    <input
                      type="text"
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="Contoh: Manis sedang, tanpa sambal..."
                      className="flex-1 text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(item.product.id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNoteItemId(null)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>
                )}

                {/* Discount Editor Inline */}
                {activeDiscountItemId === item.product.id && (
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-xs text-slate-500 font-medium">Diskon %:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tempDisc}
                      onChange={(e) => setTempDisc(e.target.value)}
                      className="w-16 text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveItemDiscount(item.product.id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800"
                    >
                      Terapkan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDiscountItemId(null)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Batal
                    </button>
                  </div>
                )}

                {/* Bottom Row: Stepper and Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleOpenNote(item.product.id, item.note)}
                      className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      title="Tambah Catatan Menu"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenItemDiscount(item.product.id, item.discountPercent)}
                      className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      title="Beri Diskon Item"
                    >
                      <Percent className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center bg-white text-slate-700 hover:bg-slate-200 transition-colors shadow-xs"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3 h-3 text-rose-500" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </button>

                    <span className="w-6 text-center font-bold text-xs font-mono text-slate-900">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className={`w-6 h-6 rounded flex items-center justify-center bg-white text-slate-700 transition-colors shadow-xs ${
                        item.quantity >= item.product.stock
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-slate-200'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Calculation & Pay Action */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-3">
        {/* Subtotal & Taxes breakdown */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span className="font-mono font-medium">{formatRupiah(cartSubtotal)}</span>
          </div>

          {/* Discount Trigger / Display */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowGlobalDiscountInput(!showGlobalDiscountInput)}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
            >
              <Percent className="w-3 h-3" />
              <span>Diskon Transaksi {cartDiscount > 0 ? `(${cartDiscount}%)` : ''}</span>
            </button>
            <span className="font-mono text-emerald-700 font-semibold">
              {cartDiscountTotal > 0 ? `- ${formatRupiah(cartDiscountTotal)}` : 'Rp 0'}
            </span>
          </div>

          {showGlobalDiscountInput && (
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500">Diskon %:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={cartDiscount}
                onChange={(e) => setCartDiscount(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="w-16 px-2 py-0.5 text-xs border border-slate-300 rounded font-mono"
              />
              <div className="flex gap-1 ml-auto">
                <button
                  type="button"
                  onClick={() => setCartDiscount(5)}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-200 rounded hover:bg-slate-300"
                >
                  5%
                </button>
                <button
                  type="button"
                  onClick={() => setCartDiscount(10)}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-200 rounded hover:bg-slate-300"
                >
                  10%
                </button>
                <button
                  type="button"
                  onClick={() => setCartDiscount(15)}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-200 rounded hover:bg-slate-300"
                >
                  15%
                </button>
              </div>
            </div>
          )}

          {settings.enableTax && (
            <div className="flex justify-between items-center">
              <span>PPN ({settings.taxRate}%)</span>
              <span className="font-mono">{formatRupiah(cartTaxAmount)}</span>
            </div>
          )}

          {settings.enableService && (
            <div className="flex justify-between items-center">
              <span>Layanan ({settings.serviceRate}%)</span>
              <span className="font-mono">{formatRupiah(cartServiceAmount)}</span>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Total Pembayaran
            </div>
            <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
              {formatRupiah(cartGrandTotal)}
            </div>
          </div>

          <button
            type="button"
            disabled={isCartEmpty}
            onClick={onOpenPayment}
            className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all ${
              isCartEmpty
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
