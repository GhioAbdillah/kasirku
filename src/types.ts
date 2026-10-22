export type Category = 'Semua' | 'Minuman' | 'Makanan' | 'Snack & Roti' | 'Paket Hemat';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number; // Harga modal untuk hitung laba bersih
  stock: number;
  sku: string;
  image?: string;
  description?: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
  discountPercent?: number; // per-item discount (0 - 100)
}

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'transfer';
export type OrderType = 'dine_in' | 'take_away';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  serviceAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  customerName?: string;
  tableNumber?: string;
  orderType: OrderType;
  createdAt: string; // ISO string
  cashierName: string;
  status: 'completed' | 'cancelled';
}

export interface HoldOrder {
  id: string;
  name: string;
  timestamp: string;
  items: CartItem[];
  customerName?: string;
  tableNumber?: string;
  orderType: OrderType;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  receiptFooter: string;
  enableTax: boolean;
  taxRate: number; // e.g. 11% PPN
  enableService: boolean;
  serviceRate: number; // e.g. 5% service charge
  soundEnabled: boolean;
  cashierName: string;
  paperWidth: '58mm' | '80mm';
}
