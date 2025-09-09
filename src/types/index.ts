export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  min_stock?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  total: number;
  items: SaleItem[];
  created_at: string;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TableOrder {
  tableNumber: number;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}