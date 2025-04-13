"use client";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "../api";
import { CartItem } from "./types";
import CartItemComponent from "./cart-item";
import { UserDetails } from "../table/[id]/types";

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
  }, []);

  useEffect(() => {
    if (user?.cart_id) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data } = await api.get<CartItem[]>("/cart/items");
      setCartItems(data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const { data } = await api.post("/orders", {
        cart_id: user?.cart_id,
      });

      toast.success("Order placed successfully!");
      router.push(`/orders/${data.order.order_id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      if (newQuantity === 0) {
        await api.delete(`/cart/items/${item.cart_item_id}`);
      } else {
        await api.put(`/cart/items/${item.cart_item_id}`, {
          quantity: newQuantity,
          notes: item.notes,
        });
      }
      await fetchCartItems();
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("Failed to update item quantity");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
        <span>Loading your cart...</span>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white">
        <div className="text-2xl font-semibold mb-4">Your cart is empty</div>
        <p className="text-gray-400">Add some items to get started</p>
      </div>
    );
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.item_price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#212121] min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Your Cart</h2>

      <div className="shadow-lg overflow-hidden">
        <div className="space-y-4 divide-gray-700 mb-4">
          {cartItems.map((item) => (
            <CartItemComponent
              key={item.cart_item_id}
              item={item}
              updateQuantity={updateQuantity}
            />
          ))}
        </div>

        <div className="p-6 bg-[#2D2D2D] rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-300">Subtotal</span>
            <span className="text-white font-medium">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          {user?.is_leader ? (
            <button
              className="w-full py-3 bg-gradient-to-r from-[#FF8030] to-[#FFA050] hover:from-[#FF7020] hover:to-[#FF9040] text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          ) : (
            <div className="w-full py-3 bg-[#2D2D2D] text-yellow-400 text-center font-medium rounded-lg border border-yellow-500 shadow-inner">
              Only the group leader can place the order
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
