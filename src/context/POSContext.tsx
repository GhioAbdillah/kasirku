import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, HoldOrder, StoreSettings, OrderType, PaymentMethod } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialProducts';
import { sounds } from '../utils/audio';
import { generateOrderNumber } from '../utils/formatters';

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  heldOrders: HoldOrder[];
  orders: Order[];
  settings: StoreSettings;
  activeTab: 'register' | 'history' | 'inventory' | 'reports' | 'settings';
  setActiveTab: (tab: 'register' | 'history' | 'inventory' | 'reports' | 'settings') => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  cartDiscount: number; // percentage discount on whole transaction
  setCartDiscount: (disc: number) => void;

  // Cart operations
  addToCart: (product: Product, qty?: number) => boolean;
  updateQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateCartItemNote: (productId: string, note: string) => void;
  updateCartItemDiscount: (productId: string, discountPercent: number) => void;

  // Hold operations
  holdCurrentOrder: (customName?: string) => boolean;
  restoreHeldOrder: (holdId: string) => void;
  deleteHeldOrder: (holdId: string) => void;

  // Checkout operations
  completeOrder: (paymentDetails: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
  }) => Order;

  // Product Inventory operations
  addProduct: (newProd: Omit<Product, 'id'>) => void;
  updateProduct: (prod: Product) => void;
  deleteProduct: (id: string) => void;
  quickAdjustStock: (id: string, delta: number) => void;

  // Settings
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetToSampleData: () => void;

  // Cart totals calculation
  cartSubtotal: number;
  cartDiscountTotal: number;
  cartTaxAmount: number;
  cartServiceAmount: number;
  cartGrandTotal: number;
  cartTotalItemsCount: number;

  // Active receipt modal
  activeReceiptOrder: Order | null;
  setActiveReceiptOrder: (order: Order | null) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with safe fallback
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_products');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('kasirku_settings');
      if (saved) return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return INITIAL_SETTINGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [heldOrders, setHeldOrders] = useState<HoldOrder[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_held_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'register' | 'history' | 'inventory' | 'reports' | 'settings'>('register');
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kasirku_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kasirku_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('kasirku_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('kasirku_held_orders', JSON.stringify(heldOrders));
  }, [heldOrders]);

  // Calculations for active cart
  const cartSubtotal = cart.reduce((sum, item) => {
    const itemDisc = (item.discountPercent || 0) / 100;
    const itemPrice = item.product.price * (1 - itemDisc);
    return sum + itemPrice * item.quantity;
  }, 0);

  const cartDiscountTotal = (cartSubtotal * (cartDiscount || 0)) / 100;
  const taxableAmount = Math.max(0, cartSubtotal - cartDiscountTotal);

  const cartTaxAmount = settings.enableTax
    ? Math.round((taxableAmount * settings.taxRate) / 100)
    : 0;

  const cartServiceAmount = settings.enableService
    ? Math.round((taxableAmount * settings.serviceRate) / 100)
    : 0;

  const cartGrandTotal = taxableAmount + cartTaxAmount + cartServiceAmount;
  const cartTotalItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Cart actions
  const addToCart = (product: Product, qty: number = 1): boolean => {
    // Check available stock
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentQtyInCart + qty > product.stock) {
      if (settings.soundEnabled) sounds.playWarning();
      return false;
    }

    if (settings.soundEnabled) sounds.playBeep();

    setCart((prev) => {
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      }
      return [...prev, { product, quantity: qty }];
    });
    return true;
  };

  const updateQuantity = (productId: string, qty: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (qty > prod.stock) {
      if (settings.soundEnabled) sounds.playWarning();
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setTableNumber('');
    setCartDiscount(0);
  };

  const updateCartItemNote = (productId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, note } : item
      )
    );
  };

  const updateCartItemDiscount = (productId: string, discountPercent: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, discountPercent: Math.max(0, Math.min(100, discountPercent)) }
          : item
      )
    );
  };

  // Hold / Restore order
  const holdCurrentOrder = (customName?: string): boolean => {
    if (cart.length === 0) return false;

    const newHold: HoldOrder = {
      id: 'hold-' + Date.now(),
      name: customName || customerName || `Pesanan #${heldOrders.length + 1}`,
      timestamp: new Date().toISOString(),
      items: [...cart],
      customerName,
      tableNumber,
      orderType,
    };

    setHeldOrders((prev) => [newHold, ...prev]);
    clearCart();
    if (settings.soundEnabled) sounds.playBeep();
    return true;
  };

  const restoreHeldOrder = (holdId: string) => {
    const target = heldOrders.find((h) => h.id === holdId);
    if (!target) return;

    setCart(target.items);
    setCustomerName(target.customerName || '');
    setTableNumber(target.tableNumber || '');
    setOrderType(target.orderType || 'dine_in');
    setHeldOrders((prev) => prev.filter((h) => h.id !== holdId));
    if (settings.soundEnabled) sounds.playBeep();
  };

  const deleteHeldOrder = (holdId: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== holdId));
  };

  // Complete Order
  const completeOrder = (paymentDetails: {
    paymentMethod: PaymentMethod;
    amountPaid: number;
  }): Order => {
    const paid = paymentDetails.amountPaid;
    const change = Math.max(0, paid - cartGrandTotal);

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: generateOrderNumber(),
      items: [...cart],
      subtotal: cartSubtotal,
      discountTotal: cartDiscountTotal,
      taxAmount: cartTaxAmount,
      serviceAmount: cartServiceAmount,
      total: cartGrandTotal,
      paymentMethod: paymentDetails.paymentMethod,
      amountPaid: paid,
      change,
      customerName: customerName || undefined,
      tableNumber: tableNumber || undefined,
      orderType,
      createdAt: new Date().toISOString(),
      cashierName: settings.cashierName,
      status: 'completed',
    };

    // Decrement stock in catalog
    setProducts((prev) =>
      prev.map((p) => {
        const cartMatch = cart.find((c) => c.product.id === p.id);
        if (cartMatch) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartMatch.quantity),
          };
        }
        return p;
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // Clear active cart
    clearCart();

    // Play chime sound
    if (settings.soundEnabled) {
      sounds.playSuccess();
    }

    // Set active receipt to show
    setActiveReceiptOrder(newOrder);

    return newOrder;
  };

  // Product management
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProd,
      id: 'prod-' + Date.now(),
    };
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (prod: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
    // Also update product ref in active cart if present
    setCart((prev) =>
      prev.map((c) => (c.product.id === prod.id ? { ...c, product: prod } : c))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    removeFromCart(id);
  };

  const quickAdjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStock = Math.max(0, p.stock + delta);
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToSampleData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders([]);
    setHeldOrders([]);
    setCart([]);
    setSettings(INITIAL_SETTINGS);
  };

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        heldOrders,
        orders,
        settings,
        activeTab,
        setActiveTab,
        customerName,
        setCustomerName,
        tableNumber,
        setTableNumber,
        orderType,
        setOrderType,
        cartDiscount,
        setCartDiscount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        updateCartItemNote,
        updateCartItemDiscount,
        holdCurrentOrder,
        restoreHeldOrder,
        deleteHeldOrder,
        completeOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        quickAdjustStock,
        updateSettings,
        resetToSampleData,
        cartSubtotal,
        cartDiscountTotal,
        cartTaxAmount,
        cartServiceAmount,
        cartGrandTotal,
        cartTotalItemsCount,
        activeReceiptOrder,
        setActiveReceiptOrder,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
