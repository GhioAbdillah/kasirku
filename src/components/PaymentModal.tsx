import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { PaymentMethod } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { cartGrandTotal, completeOrder, settings } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(cartGrandTotal);
  const [bankName, setBankName] = useState('BCA');
  const [refNumber, setRefNumber] = useState('');

  if (!isOpen) return null;

  const change = Math.max(0, cashGiven - cartGrandTotal);
  const isCashInsufficient = paymentMethod === 'cash' && cashGiven < cartGrandTotal;

  // Generate intelligent quick cash suggestion buttons based on total
  const getQuickCashOptions = () => {
    const total = cartGrandTotal;
    const options = new Set<number>();
    options.add(total); // Uang Pas

    const denominations = [10000, 20000, 50000, 100000, 200000, 500000];
    for (const d of denominations) {
      if (d >= total) {
        options.add(d);
      }
    }

    // Next round ten-thousand / fifty-thousand
    const next10k = Math.ceil(total / 10000) * 10000;
    const next50k = Math.ceil(total / 50000) * 50000;
    const next100k = Math.ceil(total / 100000) * 100000;
    if (next10k > total) options.add(next10k);
    if (next50k > total) options.add(next50k);
    if (next100k > total) options.add(next100k);

    return Array.from(options).sort((a, b) => a - b).slice(0, 5);
  };

  const handleSelectQuickCash = (amount: number) => {
    setCashGiven(amount);
  };

  const handleFinishPayment = () => {
    if (isCashInsufficient) return;

    completeOrder({
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? cashGiven : cartGrandTotal,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Pembayaran Transaksi</h3>
            <p className="text-xs text-slate-500">Pilih metode pembayaran pelanggan</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Total Box */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Tagihan Pembayaran</div>
              <div className="text-2xl font-extrabold font-mono tracking-tight text-white">
                {formatRupiah(cartGrandTotal)}
              </div>
            </div>
            <div className="text-right text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md">
              Status: Menunggu Bayar
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash');
                  setCashGiven(cartGrandTotal);
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold gap-1.5 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold gap-1.5 transition-all ${
                  paymentMethod === 'qris'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('debit')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold gap-1.5 transition-all ${
                  paymentMethod === 'debit'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Debit / EDC</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-xs font-semibold gap-1.5 transition-all ${
                  paymentMethod === 'transfer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Transfer</span>
              </button>
            </div>
          </div>

          {/* Payment Method Details */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4 pt-1">
              {/* Quick Cash Buttons */}
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">
                  Pilihan Cepat Nominal Uang:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {getQuickCashOptions().map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectQuickCash(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                        cashGiven === opt
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {opt === cartGrandTotal ? 'Uang Pas' : formatRupiah(opt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Uang Diterima dari Pelanggan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-11 pr-4 py-2.5 text-lg font-bold font-mono bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Change / Kembalian Calculation */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isCashInsufficient
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">
                    {isCashInsufficient ? 'Uang Pembayaran Kurang' : 'Kembalian Pelanggan'}
                  </div>
                  <div className="text-xl font-extrabold font-mono mt-0.5">
                    {isCashInsufficient
                      ? formatRupiah(cartGrandTotal - cashGiven)
                      : formatRupiah(change)}
                  </div>
                </div>

                {isCashInsufficient ? (
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                )}
              </div>
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center space-y-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                {/* Clean Realistic SVG QRIS Code representation */}
                <div className="w-40 h-40 bg-white flex flex-col items-center justify-center relative">
                  <div className="w-full text-center text-[10px] font-bold text-rose-600 mb-1 tracking-wider">
                    QRIS · STANDAR PEMBAYARAN
                  </div>
                  <svg className="w-32 h-32" viewBox="0 0 100 100">
                    {/* Finder patterns */}
                    <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="3" />
                    <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="1" />
                    <rect x="13" y="13" width="12" height="12" fill="#0f172a" rx="1" />

                    <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="3" />
                    <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="1" />
                    <rect x="75" y="13" width="12" height="12" fill="#0f172a" rx="1" />

                    <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="3" />
                    <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="1" />
                    <rect x="13" y="75" width="12" height="12" fill="#0f172a" rx="1" />

                    {/* QR Data Matrix grid dots */}
                    <rect x="38" y="10" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="10" width="6" height="6" fill="#0f172a" />
                    <rect x="56" y="16" width="6" height="6" fill="#0f172a" />
                    <rect x="38" y="24" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="24" width="6" height="6" fill="#0f172a" />

                    <rect x="10" y="38" width="6" height="6" fill="#0f172a" />
                    <rect x="22" y="38" width="6" height="6" fill="#0f172a" />
                    <rect x="38" y="38" width="8" height="8" fill="#0f172a" />
                    <rect x="52" y="38" width="8" height="8" fill="#0f172a" />
                    <rect x="66" y="38" width="6" height="6" fill="#0f172a" />
                    <rect x="78" y="38" width="6" height="6" fill="#0f172a" />

                    <rect x="10" y="52" width="6" height="6" fill="#0f172a" />
                    <rect x="22" y="48" width="6" height="6" fill="#0f172a" />
                    <rect x="38" y="52" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="52" width="6" height="6" fill="#0f172a" />
                    <rect x="58" y="52" width="6" height="6" fill="#0f172a" />
                    <rect x="70" y="48" width="6" height="6" fill="#0f172a" />
                    <rect x="82" y="52" width="6" height="6" fill="#0f172a" />

                    <rect x="38" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="58" y="74" width="6" height="6" fill="#0f172a" />
                    <rect x="70" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="78" y="74" width="6" height="6" fill="#0f172a" />
                    <rect x="84" y="66" width="6" height="6" fill="#0f172a" />
                    <rect x="74" y="84" width="6" height="6" fill="#0f172a" />
                    <rect x="84" y="84" width="6" height="6" fill="#0f172a" />
                  </svg>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">
                    NMID: ID1029384756291
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                Arahkan pelanggan scan QRIS melalui GoPay, OVO, ShopeePay, DANA, BCA, dll.
              </div>
            </div>
          )}

          {paymentMethod === 'debit' && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Pilih Mesin EDC / Bank
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['BCA', 'Mandiri', 'BRI', 'BNI'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setBankName(bank)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        bankName === bank
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nomor Referensi / Approval Code (Opsional)
                </label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="Contoh: REF-839201"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'transfer' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-700">Nomor Rekening Toko:</div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1 font-mono">
                <div>Bank BCA: <strong>8920-192-384</strong></div>
                <div>A.N: <strong>{settings.storeName}</strong></div>
              </div>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="No. Bukti Transfer Pelanggan (opsional)"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono mt-1"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isCashInsufficient}
            onClick={handleFinishPayment}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
              isCashInsufficient
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi Pembayaran</span>
          </button>
        </div>
      </div>
    </div>
  );
};
