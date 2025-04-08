"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Loader2,
  ShoppingCart,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CartItem, CartResponse } from "../cart/types";
import CartItemComponent from "../cart/cart-item";

const AdminDashboard: React.FC = () => {
  const [carts, setCarts] = useState<CartResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCartId, setExpandedCartId] = useState<string | null>(null);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const res = await axios.get<CartResponse[]>(
        `${process.env.NEXT_PUBLIC_BASEURL}/cart/`
      );
      setCarts(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching carts:", err);
      setLoading(false);
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_BASEURL}/cart/`, {
        item_id: item.item_id,
        quantity: newQuantity,
        user_id: item.user_id[0], // Using first user_id from the array
      });

      fetchCarts();
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const toggleCartExpansion = (cartId: string) => {
    if (expandedCartId === cartId) {
      setExpandedCartId(null);
    } else {
      setExpandedCartId(cartId);
    }
  };

  const markAsPaid = async (cartId: string) => {
    try {
      // Replace with actual API call to update payment status
      await axios.patch(`${process.env.NEXT_PUBLIC_BASEURL}/cart/payment`, {
        cart_id: cartId,
        payment_status: "Paid",
      });
      fetchCarts();
    } catch (err) {
      console.error("Error updating payment status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  // Analytics from available cart data
  const totalCarts = carts.length;
  const paidCarts = carts.filter(
    (cart) => cart.payment_status === "Paid"
  ).length;
  const pendingCarts = carts.filter(
    (cart) => cart.payment_status !== "Paid"
  ).length;
  const totalRevenue = carts.reduce((sum, cart) => sum + cart.bill_amount, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-[#212121] min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

      {/* Analytics Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2D2D2D] p-6 rounded-xl shadow">
          <div className="flex items-center mb-4">
            <ShoppingCart className="w-6 h-6 mr-3 text-[#FF8030]" />
            <h3 className="text-white text-lg font-medium">Orders</h3>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-white text-2xl font-bold">{totalCarts}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-yellow-400 text-2xl font-bold">
                {pendingCarts}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Paid</p>
              <p className="text-green-400 text-2xl font-bold">{paidCarts}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2D2D2D] p-6 rounded-xl shadow">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 mr-3 text-[#FF8030]" />
            <h3 className="text-white text-lg font-medium">Total Revenue</h3>
          </div>
          <p className="text-white text-3xl font-bold">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Orders List Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">All Orders</h2>

        <div className="bg-[#2D2D2D] rounded-xl shadow overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 p-4 bg-[#3D3D3D] text-white font-medium">
            <div>Order ID</div>
            <div>Items</div>
            <div>Amount</div>
            <div>Status</div>
          </div>

          {/* Orders List */}
          {carts.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {carts.map((cart, index) => (
                <div key={index} className="text-white">
                  {/* Order Summary Row */}
                  <div
                    className="grid grid-cols-4 p-4 cursor-pointer hover:bg-[#343434]"
                    onClick={() => toggleCartExpansion(cart.cart_id)}
                  >
                    <div className="font-medium">#{cart.cart_id}</div>
                    <div>{cart.items?.length || 0} items</div>
                    <div>${cart.bill_amount.toFixed(2)}</div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          cart.payment_status === "Paid"
                            ? "bg-green-900 text-green-400"
                            : "bg-yellow-900 text-yellow-400"
                        }`}
                      >
                        {cart.payment_status}
                      </span>
                      {expandedCartId === cart.cart_id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {expandedCartId === cart.cart_id && (
                    <div className="bg-[#262626] p-6">
                      <h3 className="text-lg font-medium mb-4">
                        Order Details
                      </h3>

                      {cart.items && cart.items.length > 0 ? (
                        <div className="space-y-4 mb-6">
                          {cart.items.map((item, index) => (
                            <CartItemComponent
                              key={index}
                              item={item}
                              updateQuantity={updateQuantity}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 mb-6">
                          No items in this order
                        </p>
                      )}

                      <div className="flex justify-between items-center border-t border-gray-700 pt-4">
                        <div>
                          <p className="text-gray-400">
                            Customer:{" "}
                            {cart.items?.[0]?.user_name?.[0] || "Unknown"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-white font-medium">
                            Total: ${cart.bill_amount.toFixed(2)}
                          </p>
                          {cart.payment_status !== "Paid" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsPaid(cart.cart_id);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-[#FF8030] to-[#FFA050] hover:from-[#FF7020] hover:to-[#FF9040] text-white font-medium rounded-lg transition-all duration-200"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400">No orders found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
