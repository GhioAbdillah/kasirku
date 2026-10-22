/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Navbar } from './components/Navbar';
import { ProductCatalog } from './components/ProductCatalog';
import { CartSidebar } from './components/CartSidebar';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { HoldOrdersModal } from './components/HoldOrdersModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { HistoryView } from './components/HistoryView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { formatRupiah } from './utils/formatters';

const POSMain: React.FC = () => {
  const { activeTab, cartGrandTotal, cartTotalItemsCount } = usePOS();

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Mobile cart sheet toggle for smaller screens
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 select-none">
      {/* Top Bar adhering to strict design contract */}
      <Navbar
        onOpenHoldModal={() => setIsHoldModalOpen(true)}
        onOpenQuickScan={() => setIsScannerOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'register' && (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-57px)] overflow-hidden relative">
            {/* Catalog (Product Grid & Category Filter) */}
            <ProductCatalog />

            {/* Desktop Cart Sidebar */}
            <div className="hidden lg:block h-full">
              <CartSidebar onOpenPayment={() => setIsPaymentOpen(true)} />
            </div>

            {/* Mobile Bottom Bar for Cart Drawer Toggle */}
            <div className="lg:hidden p-3 bg-white border-t border-slate-200 flex items-center justify-between sticky bottom-0 z-20 shadow-md">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {cartTotalItemsCount} item di keranjang
                </div>
                <div className="text-base font-extrabold font-mono text-slate-900">
                  {formatRupiah(cartGrandTotal)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileCartOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buka Keranjang</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Cart Drawer Overlay */}
            {isMobileCartOpen && (
              <div className="lg:hidden fixed inset-0 z-40 bg-black/50 flex flex-col justify-end">
                <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
                    <span className="text-xs font-bold text-slate-800">Keranjang Kasir</span>
                    <button
                      onClick={() => setIsMobileCartOpen(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <CartSidebar
                      onOpenPayment={() => {
                        setIsMobileCartOpen(false);
                        setIsPaymentOpen(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
      <ReceiptModal />
      <HoldOrdersModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
      />
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <POSMain />
    </POSProvider>
  );
}
