import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { formatRupiah, exportToCSV } from '../utils/formatters';
import {
  Download,
  Calendar,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { orders } = usePOS();
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'all'>('month');

  // Filter orders by chosen period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      if (period === 'today') {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }
      if (period === '7days') {
        const diff = Math.abs(now.getTime() - d.getTime());
        return diff <= 7 * 24 * 60 * 60 * 1000;
      }
      if (period === 'month') {
        return (
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [orders, period]);

  // Aggregate metrics
  const totalOmset = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalDiskon = filteredOrders.reduce((sum, o) => sum + o.discountTotal, 0);
  const totalPajak = filteredOrders.reduce((sum, o) => sum + o.taxAmount, 0);

  // Compute Cost of Goods Sold (COGS)
  const totalModal = filteredOrders.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((acc, item) => {
        const cost = item.product.costPrice || 0;
        return acc + cost * item.quantity;
      }, 0)
    );
  }, 0);

  const labaKotor = Math.max(0, totalOmset - totalPajak - totalModal);

  // Top selling products calculation
  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { name: string; category: string; qty: number; revenue: number }
    >();

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const id = item.product.id;
        const existing = map.get(id);
        const itemRev =
          item.product.price *
          (1 - (item.discountPercent || 0) / 100) *
          item.quantity;

        if (existing) {
          existing.qty += item.quantity;
          existing.revenue += itemRev;
        } else {
          map.set(id, {
            name: item.product.name,
            category: item.product.category,
            qty: item.quantity,
            revenue: itemRev,
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
  }, [filteredOrders]);

  // Payment method breakdown
  const paymentMethodStats = useMemo(() => {
    const stats = { cash: 0, qris: 0, debit: 0, transfer: 0 };
    filteredOrders.forEach((o) => {
      if (stats[o.paymentMethod] !== undefined) {
        stats[o.paymentMethod] += o.total;
      }
    });
    return stats;
  }, [filteredOrders]);

  // Dine in vs Take away
  const orderTypeStats = useMemo(() => {
    const dineIn = filteredOrders.filter((o) => o.orderType === 'dine_in').length;
    const takeAway = filteredOrders.filter((o) => o.orderType === 'take_away').length;
    return { dineIn, takeAway };
  }, [filteredOrders]);

  const handleExportReport = () => {
    const rows = [
      ['LAPORAN KINERJA PENJUALAN'],
      ['Periode', period],
      ['Total Omset', totalOmset],
      ['Total Modal (COGS)', totalModal],
      ['Estimasi Laba Bersih', labaKotor],
      ['Total Transaksi', filteredOrders.length],
      [],
      ['PRODUK TERLARIS'],
      ['Nama Produk', 'Kategori', 'Jumlah Terjual', 'Total Omset'],
      ...topProducts.map((p) => [p.name, p.category, p.qty, p.revenue]),
    ];

    exportToCSV(`laporan-keuangan-${period}.csv`, rows);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-[1440px] mx-auto w-full space-y-6">
      {/* Header & Period Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Laporan &amp; Analitik Penjualan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis pendapatan, keuntungan bersih, dan performa menu terlaris
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['today', '7days', 'month', 'all'] as const).map((p) => {
              const labels = {
                today: 'Hari Ini',
                '7days': '7 Hari',
                month: 'Bulan Ini',
                all: 'Semua',
              };
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === p
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Laporan</span>
          </button>
        </div>
      </div>

      {/* Primary KPI 4-Card Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Omset Kotor
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-2">
            {formatRupiah(totalOmset)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {filteredOrders.length} total transaksi berhasil
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Modal Produk (HPP)
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-700 mt-2">
            {formatRupiah(totalModal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Biaya bahan &amp; modal kulakan
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
            Estimasi Laba Bersih
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-2">
            +{formatRupiah(labaKotor)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Omset dikurangi modal &amp; pajak
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Diskon Diberikan
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 mt-2">
            {formatRupiah(totalDiskon)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Potongan promo &amp; diskon item
          </div>
        </div>
      </div>

      {/* Grid: Top Selling Products & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products (2 columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Produk Terlaris (Top Selling Menu)
            </h3>
            <span className="text-xs text-slate-400">Diurutkan berdasar jumlah laku</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400">
              Belum ada penjualan di periode ini.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 7).map((prod, idx) => {
                const maxQty = topProducts[0]?.qty || 1;
                const percent = Math.round((prod.qty / maxQty) * 100);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 font-bold font-mono text-slate-400 text-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {prod.name}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({prod.category})
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-slate-600">
                          {prod.qty} terjual
                        </span>
                        <span className="font-mono font-bold text-slate-900 min-w-[80px] text-right">
                          {formatRupiah(prod.revenue)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Methods & Order Types (1 column wide) */}
        <div className="space-y-6">
          {/* Payment Method Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Distribusi Metode Pembayaran
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Tunai (Cash)</span>
                </div>
                <div className="font-mono font-bold text-xs text-slate-900">
                  {formatRupiah(paymentMethodStats.cash)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <QrCode className="w-4 h-4 text-rose-600" />
                  <span>QRIS Digital</span>
                </div>
                <div className="font-mono font-bold text-xs text-slate-900">
                  {formatRupiah(paymentMethodStats.qris)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Debit / EDC</span>
                </div>
                <div className="font-mono font-bold text-xs text-slate-900">
                  {formatRupiah(paymentMethodStats.debit)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Transfer Bank</span>
                </div>
                <div className="font-mono font-bold text-xs text-slate-900">
                  {formatRupiah(paymentMethodStats.transfer)}
                </div>
              </div>
            </div>
          </div>

          {/* Dine-In vs Take-Away */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Layanan Pesanan
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <UtensilsCrossed className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <div className="text-xs text-slate-500">Makan di Tempat</div>
                <div className="font-bold font-mono text-base text-slate-900 mt-0.5">
                  {orderTypeStats.dineIn}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <ShoppingBag className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <div className="text-xs text-slate-500">Bawa Pulang</div>
                <div className="font-bold font-mono text-base text-slate-900 mt-0.5">
                  {orderTypeStats.takeAway}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
