import React from 'react';
import { usePOS } from '../context/POSContext';
import { ShoppingBag, History, Package, BarChart3, Settings, PauseCircle, QrCode } from 'lucide-react';

interface NavbarProps {
  onOpenHoldModal: () => void;
  onOpenQuickScan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenHoldModal, onOpenQuickScan }) => {
  const { activeTab, setActiveTab, heldOrders, settings } = usePOS();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between gap-8 px-5 py-3 max-w-[1600px] mx-auto">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            K
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 tracking-tight leading-none">
              {settings.storeName || 'KasirKu POS'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {settings.cashierName || 'Kasir Aktif'}
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'register'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Kasir (POS)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Transaksi</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Kelola Produk</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'reports'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Laporan Penjualan</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Group */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenQuickScan}
            title="Scan Barcode / SKU Cepat"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan SKU</span>
          </button>

          <button
            onClick={onOpenHoldModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              heldOrders.length > 0
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PauseCircle className="w-4 h-4" />
            <span>Hold</span>
            {heldOrders.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {heldOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
