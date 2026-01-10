// src/types/api.types.ts

export interface APIResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  vendor_id?: string;
  business_name?: string;
  message: string;
}

export interface RegisterResponse {
  message: string;
  username: string;
  status: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  vendor: string;
  categories: string[];
  category_ids: string[];
  categories_list: Array<{ id: string; name: string }>;
  name: string;
  description?: string;
  price: string | number;
  stock_quantity: number;
  sku?: string;
  barcode?: string;
  is_active: boolean;
  sort_order: number;
  vendor_name: string;
  image?: string;
  image_url?: string;
  last_updated: string;
  created_at: string;
}

export interface BillItem {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Bill {
  id: string;
  bill_number: string;
  items: BillItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method?: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  timestamp: string;
}

export interface SyncResponse {
  synced: number;
  created: number;
  updated: number;
  deleted: number;
  categories?: Category[];
  items?: Item[];
  bills?: Bill[];
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: {
      status: string;
      message: string;
    };
    cache?: {
      status: string;
      message: string;
    };
  };
  system: {
    django_version: string;
    python_version: string;
    debug_mode: boolean;
  };
  stats?: {
    users: number;
    vendors: number;
    items: number;
    categories: number;
    sales_backups: number;
  };
}