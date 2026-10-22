import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Search, Plus, Utensils, Coffee, Cookie, Box, Flame, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Semua', 'Minuman', 'Makanan', 'Snack & Roti', 'Paket Hemat'];

export const ProductCatalog: React.FC = () => {
  const { products, addToCart, cart } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCat =
        selectedCategory === 'Semua' || prod.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.sku.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const getProductIcon = (category: string) => {
    switch (category) {
      case 'Minuman':
        return <Coffee className="w-8 h-8 text-slate-400" />;
      case 'Makanan':
        return <Utensils className="w-8 h-8 text-slate-400" />;
      case 'Snack & Roti':
        return <Cookie className="w-8 h-8 text-slate-400" />;
      default:
        return <Box className="w-8 h-8 text-slate-400" />;
    }
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white border-b border-slate-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk atau ketik SKU / Barcode..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Box className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-sm">Produk tidak ditemukan</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-4">
            {filteredProducts.map((product) => {
              const inCartQty = getCartQuantity(product.id);
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`group relative bg-white border rounded-xl overflow-hidden flex flex-col transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'border-slate-200 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:border-slate-400 hover:shadow-sm active:scale-[0.99]'
                  }`}
                >
                  {/* Image container */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to container icon if image fails
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}

                    {/* Fallback Icon Container */}
                    <div
                      className={`w-full h-full flex items-center justify-center bg-slate-100 ${
                        product.image ? 'hidden' : 'flex'
                      }`}
                    >
                      {getProductIcon(product.category)}
                    </div>

                    {/* Stock Alert or Popular tag */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
                      {product.isPopular && !isOutOfStock && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                          <Flame className="w-3 h-3 fill-current" />
                          Favorit
                        </span>
                      )}
                      {isLowStock && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                          <AlertCircle className="w-3 h-3" />
                          Sisa {product.stock}
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-bold">
                          Habis
                        </span>
                      )}
                    </div>

                    {/* In-cart counter floating badge */}
                    {inCartQty > 0 && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                        {inCartQty}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                        {product.category} · {product.sku}
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm mt-0.5 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Harga</div>
                        <div className="font-bold text-slate-900 font-mono text-sm">
                          {formatRupiah(product.price)}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) addToCart(product);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-300'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                        }`}
                        title="Tambah ke pesanan"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
