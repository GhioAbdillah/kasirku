import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { Order } from '../types';
import { formatRupiah, formatIndoDate, exportToCSV } from '../utils/formatters';
import {
  Search,
  Download,
  Eye,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { orders, setActiveReceiptOrder } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'month' | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'qris' | 'debit' | 'transfer'>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Date filter
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        const isToday =
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (dateFilter === '7days') {
        const diffTime = Math.abs(now.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 7) return false;
      } else if (dateFilter === 'month') {
        const isThisMonth =
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
        if (!isThisMonth) return false;
      }

      // Method filter
      if (methodFilter !== 'all' && order.paymentMethod !== methodFilter) {
        return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = order.orderNumber.toLowerCase().includes(q);
        const matchCust = (order.customerName || '').toLowerCase().includes(q);
        const matchCashier = order.cashierName.toLowerCase().includes(q);
        if (!matchNum && !matchCust && !matchCashier) return false;
      }

      return true;
    });
  }, [orders, dateFilter, methodFilter, searchQuery]);

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCount = filteredOrders.length;
  const avgTicket = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const header = [
      'No. Order',
      'Tanggal',
      'Kasir',
      'Pelanggan',
      'Tipe',
      'Metode Bayar',
      'Subtotal',
      'Diskon',
      'Pajak',
      'Layanan',
      'Total',
    ];

    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      formatIndoDate(o.createdAt),
      o.cashierName,
      o.customerName || '-',
      o.orderType === 'dine_in' ? 'Dine In' : 'Take Away',
      o.paymentMethod.toUpperCase(),
      o.subtotal,
      o.discountTotal,
      o.taxAmount,
      o.serviceAmount,
      o.total,
    ]);

    exportToCSV(`rekap-transaksi-${new Date().toISOString().slice(0, 10)}.csv`, [
      header,
      ...rows,
    ]);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-medium text-xs">
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tunai</span>
          </span>
        );
      case 'qris':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-medium text-xs">
            <QrCode className="w-3.5 h-3.5 text-rose-600" />
            <span>QRIS</span>
          </span>
        );
      case 'debit':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-medium text-xs">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Debit</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-medium text-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Transfer</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-[1440px] mx-auto w-full space-y-6">
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Riwayat Transaksi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh transaksi kasir yang telah selesai dan tercatat
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filteredOrders.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start md:self-auto ${
            filteredOrders.length === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Omset Penjualan</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Dari {totalCount} transaksi
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Jumlah Transaksi</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Pesanan sukses tercatat
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Rata-rata Nilai Belanja</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatRupiah(avgTicket)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Per transaksi pelanggan
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no nota, nama pelanggan, kasir..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Waktu:
          </span>
          {(['all', 'today', '7days', 'month'] as const).map((filter) => {
            const labels = {
              all: 'Semua',
              today: 'Hari Ini',
              '7days': '7 Hari',
              month: 'Bulan Ini',
            };
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  dateFilter === filter
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        {/* Method Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-400 mr-1">Metode:</span>
          {(['all', 'cash', 'qris', 'debit'] as const).map((m) => {
            const labels = {
              all: 'Semua',
              cash: 'Tunai',
              qris: 'QRIS',
              debit: 'Debit',
            };
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMethodFilter(m)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  methodFilter === m
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[m]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <p className="font-semibold text-slate-700 text-sm">Tidak ada transaksi ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">
              Belum ada penjualan pada periode atau filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pelanggan / Tipe</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4 text-right">Total Tagihan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const itemsCount = order.items.reduce((a, b) => a + b.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatIndoDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {order.customerName || 'Pelanggan Umum'}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          {order.orderType === 'dine_in' ? (
                            <>
                              <UtensilsCrossed className="w-3 h-3 text-slate-500" />
                              <span>Dine In {order.tableNumber ? `· Meja ${order.tableNumber}` : ''}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3 h-3 text-slate-500" />
                              <span>Take Away {order.tableNumber ? `· #${order.tableNumber}` : ''}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold">{itemsCount} item</span>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {order.items.map((i) => i.product.name).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getMethodBadge(order.paymentMethod)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(order.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveReceiptOrder(order)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          title="Lihat Struk / Cetak Ulang"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Struk</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
