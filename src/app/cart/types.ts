export interface MenuItem {
  item_id: string;
  item_name: string;
  price: number;
  is_available: boolean;
  category: string;
  est_prep_time: number;
  description: string;
  images: string | string[];
}

export type MenuResponse = MenuItem[];

export interface CartItem {
  cart_item_id: string;
  cart_id: string;
  item_id: string;
  user_id: string;
  quantity: number;
  item_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  item: MenuItem;
}

export type CartResponse = CartItem[];
export interface Cart {
  cart_id: string;
  payment_status: string;
  bill_amount: number;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  price: number;
  notes?: string;
  item?: MenuItem;
}

export interface Order {
  order_id: string;
  cart_id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface UserDetails {
  user_id: string;
  cart_id: string;
  is_leader: boolean;
  created_at: string;
  user_name: string;
  token?: string;
}

export interface CreateCartResponse extends Cart {}

export interface AddToCartResponse extends CartItem {}

export interface OrderResponse {
  items: OrderItem[];
  order: Order;
}
