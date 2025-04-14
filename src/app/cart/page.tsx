"use client";
import React, { useEffect, useState } from "react";
import { Loader2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
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
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (user?.cart_id) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data } = await api.get<CartItem[]>("/cart/items");
      setCartItems(data);
      if (typeof window !== "undefined") {
        localStorage.setItem("cartData", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await api.post("/orders", {
        cart_id: user?.cart_id,
      });

      toast.success("Order placed successfully!");
      if (typeof window !== "undefined") {
        localStorage.setItem("cartData", JSON.stringify([]));
      }
      router.push(`/orders`);
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.item_price * item.quantity,
    0
  );

  const estimatedTime = cartItems.reduce((maxTime, item) => {
    const itemTime = item.item.est_prep_time || 0;
    return Math.max(maxTime, itemTime);
  }, 0);

  return (
    <div className="min-h-screen bg-[#212121]">
      <header className="sticky top-0 z-10 bg-[#2D2D2D] shadow-md">
        <div className="p-4 flex items-center gap-3">
          <Link href="/menu" className="text-gray-300 hover:text-[#FFA050]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Your Cart</h1>
        </div>
      </header>

      <main className="p-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-white">
            <Loader2 className="w-10 h-10 mb-4 animate-spin text-[#FFA050]" />
            <span>Loading your cart...</span>
          </div>
        ) : !cartItems.length ? (
          <div className="flex flex-col items-center justify-center h-64 text-white">
            <div className="p-6 bg-[#2D2D2D] rounded-full mb-6">
              <ShoppingBag size={40} className="text-[#FFA050]" />
            </div>
            <div className="text-2xl font-semibold mb-3">
              Your cart is empty
            </div>
            <p className="text-gray-400 mb-6">
              Add some delicious items to get started
            </p>
            <Link href="/menu">
              <button className="px-6 py-3 bg-gradient-to-r from-[#FF8030] to-[#FFA050] hover:from-[#FF7020] hover:to-[#FF9040] text-white font-medium rounded-lg transition-all duration-200 shadow-lg">
                Browse Menu
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <CartItemComponent
                  key={item.cart_item_id}
                  item={item}
                  updateQuantity={updateQuantity}
                />
              ))}
            </div>

            <div className="bg-[#2D2D2D] rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-gray-700">
                <div className="text-lg font-medium text-white mb-1">
                  Order Summary
                </div>
                <div className="text-sm text-gray-400">
                  Estimated time: {estimatedTime} minutes
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-medium text-lg pt-2 border-t border-gray-700">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-4 pt-0">
                {user?.is_leader ? (
                  <button
                    className="w-full py-3 bg-gradient-to-r from-[#FF8030] to-[#FFA050] hover:from-[#FF7020] hover:to-[#FF9040] text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
                    onClick={handlePlaceOrder}
                  >
                    Place Order • ${subtotal.toFixed(2)}
                  </button>
                ) : (
                  <div className="w-full py-3 bg-[#3D3D3D] text-amber-400 text-center font-medium rounded-lg border border-amber-700/30 shadow-inner">
                    Only the group leader can place the order
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Cart;
