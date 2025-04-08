"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { CartItem, CartResponse } from "./types";

import { Loader2 } from "lucide-react";
import CartItemComponent from "./cart-item";
import { UserDetails } from "../table/[id]/types";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import api from "../api";

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);

  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") ?? "{}"
    ) as UserDetails;

    setUser(storedUser);
  }, []);

  useEffect(() => {
    if (user?.cart_id) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get<CartResponse[]>(`/cart/`);
      setCart(res.data.find((cart) => cart.cart_id == user?.cart_id) || null);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await api.post(`/order`, {
        cart_id: user?.cart_id,
      });
      toast.success("Order placed successfully!");
      router.push("/order");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      await api.patch(`/cart/`, {
        item_id: item.item_id,
        quantity: newQuantity,
        user_id: user?.user_id,
      });

      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
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

  if (!cart?.items || cart.items?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white">
        <div className="text-2xl font-semibold mb-4">Your cart is empty</div>
        <p className="text-gray-400">Add some items to get started</p>
      </div>
    );
  }

  const totalPrice = cart.items?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#212121] min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Your Cart</h2>

      <div className="shadow-lg overflow-hidden">
        <div className="space-y-4 divide-gray-700 mb-4">
          {cart.items?.map((item, index) => (
            <CartItemComponent
              key={index}
              item={item}
              updateQuantity={updateQuantity}
            />
          ))}
        </div>

        <div className="p-6 bg-[#2D2D2D] rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-300">Subtotal</span>
            <span className="text-white font-medium">
              ${totalPrice?.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center my-6">
            <div className="flex items-center">
              <span className="text-gray-300 mr-2">Payment Status:</span>
              <span
                className={`font-medium capitalize ${
                  cart.payment_status === "Paid"
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {cart.payment_status}
              </span>
            </div>
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
