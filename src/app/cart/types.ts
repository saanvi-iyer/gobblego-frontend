export interface CartItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  user_id: string[];
  user_name: string[];
  image: string;
}

export interface CartResponse {
  cart_id: string;
  items: CartItem[] | null;
  payment_status: string;
  bill_amount: number;
}
