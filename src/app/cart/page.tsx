"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { CartItem, CartResponse } from "./types";

import { Loader2 } from "lucide-react";
import CartItemComponent from "./cart-item";

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get<CartResponse[]>(
        `${process.env.NEXT_PUBLIC_BASEURL}/cart/`
      );
      if (res.data.length > 0) {
        setCart(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_BASEURL}/cart/`, {
        item_id: item.item_id,
        quantity: newQuantity,
        user_id: item.user_id,
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white">
        <div className="text-2xl font-semibold mb-4">Your cart is empty</div>
        <p className="text-gray-400">Add some items to get started</p>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Your Cart</h2>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-700">
          {cart.items.map((item, index) => (
            <CartItemComponent
              key={index}
              item={item}
              updateQuantity={updateQuantity}
            />
          ))}
        </div>

        <div className="p-6 bg-gray-900">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-300">Subtotal</span>
            <span className="text-white font-medium">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <span className="text-gray-300 mr-2">Payment Status:</span>
              <span
                className={`font-medium ${
                  cart.payment_status === "Paid"
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {cart.payment_status}
              </span>
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-[#FF8030] to-[#FFA050] hover:from-[#FF7020] hover:to-[#FF9040] text-white font-medium rounded-lg transition-all duration-200 shadow-lg">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
