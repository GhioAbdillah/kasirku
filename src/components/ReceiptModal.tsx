import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { formatRupiah, formatIndoDate } from '../utils/formatters';
import { Printer, Share2, Copy, Check, PlusCircle, X } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceiptOrder, setActiveReceiptOrder, settings } = usePOS();
  const [copied, setCopied] = useState(false);

  if (!activeReceiptOrder) return null;

  const order = activeReceiptOrder;

  const handlePrint = () => {
    window.print();
  };

  const getPlainTextReceipt = () => {
    const lines = [
      `================================`,
      `       ${settings.storeName.toUpperCase()}`,
      `   ${settings.address}`,
      `       Telp: ${settings.phone}`,
      `================================`,
      `No. Nota : ${order.orderNumber}`,
      `Waktu    : ${formatIndoDate(order.createdAt)}`,
      `Kasir    : ${order.cashierName}`,
      `Tipe     : ${order.orderType === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang'}`,
      order.customerName ? `Pelanggan: ${order.customerName}` : null,
      order.tableNumber ? `Meja/Antr: ${order.tableNumber}` : null,
      `--------------------------------`,
      ...order.items.map((i) => {
        const itemTotal =
          i.product.price * (1 - (i.discountPercent || 0) / 100) * i.quantity;
        return `${i.product.name}\n  ${i.quantity} x ${formatRupiah(i.product.price)} = ${formatRupiah(itemTotal)}`;
      }),
      `--------------------------------`,
      `Subtotal       : ${formatRupiah(order.subtotal)}`,
      order.discountTotal > 0
        ? `Diskon         : -${formatRupiah(order.discountTotal)}`
        : null,
      order.taxAmount > 0 ? `PPN            : ${formatRupiah(order.taxAmount)}` : null,
      order.serviceAmount > 0
        ? `Layanan        : ${formatRupiah(order.serviceAmount)}`
        : null,
      `TOTAL          : ${formatRupiah(order.total)}`,
      `Metode Bayar   : ${order.paymentMethod.toUpperCase()}`,
      `Bayar          : ${formatRupiah(order.amountPaid)}`,
      `Kembali        : ${formatRupiah(order.change)}`,
      `================================`,
      settings.receiptFooter || 'Terima kasih atas kunjungan Anda!',
      `================================`,
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getPlainTextReceipt()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getPlainTextReceipt());
    const waUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Tunai (Cash)';
      case 'qris':
        return 'QRIS Digital';
      case 'debit':
        return 'Debit / EDC';
      case 'transfer':
        return 'Transfer Bank';
      default:
        return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-slate-900 text-sm">Transaksi Berhasil</h3>
          </div>
          <button
            onClick={() => setActiveReceiptOrder(null)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Preview (Printable element) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div
            id="thermal-receipt-printable"
            className="w-full max-w-[340px] bg-white p-5 rounded-lg shadow-sm font-mono text-[11px] leading-relaxed text-slate-800 border border-slate-200"
          >
            {/* Header / Store Info */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                {settings.storeName}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{settings.address}</p>
              <p className="text-[10px] text-slate-500">Telp: {settings.phone}</p>
            </div>

            {/* Meta Info */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>No. Transaksi</span>
                <span className="font-bold text-slate-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span>{formatIndoDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Layanan</span>
                <span className="font-bold">
                  {order.orderType === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang'}
                </span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span>Pelanggan</span>
                  <span>{order.customerName}</span>
                </div>
              )}
              {order.tableNumber && (
                <div className="flex justify-between">
                  <span>Meja/Antrean</span>
                  <span>#{order.tableNumber}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              {order.items.map((item, idx) => {
                const itemTotal =
                  item.product.price *
                  (1 - (item.discountPercent || 0) / 100) *
                  item.quantity;

                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="truncate pr-2">{item.product.name}</span>
                      <span>{formatRupiah(itemTotal)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>
                        {item.quantity} x {formatRupiah(item.product.price)}
                        {(item.discountPercent || 0) > 0 && ` (Disc ${item.discountPercent}%)`}
                      </span>
                    </div>
                    {item.note && (
                      <div className="text-[9px] text-slate-500 italic">
                        * {item.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon</span>
                  <span>-{formatRupiah(order.discountTotal)}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>PPN ({settings.taxRate}%)</span>
                  <span>{formatRupiah(order.taxAmount)}</span>
                </div>
              )}
              {order.serviceAmount > 0 && (
                <div className="flex justify-between">
                  <span>Layanan ({settings.serviceRate}%)</span>
                  <span>{formatRupiah(order.serviceAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
            </div>

            {/* Payment & Change */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Metode Bayar</span>
                <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bayar Diterima</span>
                <span>{formatRupiah(order.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>Kembalian</span>
                <span>{formatRupiah(order.change)}</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-3 text-center text-[10px] text-slate-500 whitespace-pre-line">
              {settings.receiptFooter || 'Terima kasih atas kunjungan Anda!'}
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Struk</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveReceiptOrder(null)}
            className="w-full py-2.5 text-center text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
