"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import api from "../api";

interface OrderItem {
  item_id: string;
  user_id?: string;
  user_ids?: string[];
  quantity: number;
}

interface Order {
  order_id: string;
  cart_id: string;
  items: OrderItem[];
  order_status: string;
  created_at: string;
  updated_at: string;
}

interface OrdersResponse {
  orders: Order[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get<OrdersResponse>(`/order`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/order/${orderId}`, {
        order_status: status,
      });
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
        <span>Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-[#212121] min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Order Management</h1>

      {/* Orders Summary */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2D2D2D] p-6 rounded-xl shadow">
          <h3 className="text-white text-lg font-medium mb-2">Total Orders</h3>
          <p className="text-white text-2xl font-bold">{orders.length}</p>
        </div>

        <div className="bg-[#2D2D2D] p-6 rounded-xl shadow">
          <h3 className="text-white text-lg font-medium mb-2">
            Pending Orders
          </h3>
          <p className="text-yellow-400 text-2xl font-bold">
            {orders.filter((order) => order.order_status === "pending").length}
          </p>
        </div>

        <div className="bg-[#2D2D2D] p-6 rounded-xl shadow">
          <h3 className="text-white text-lg font-medium mb-2">
            Completed Orders
          </h3>
          <p className="text-green-400 text-2xl font-bold">
            {
              orders.filter((order) => order.order_status === "completed")
                .length
            }
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">All Orders</h2>

        <div className="bg-[#2D2D2D] rounded-xl shadow overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 p-4 bg-[#3D3D3D] text-white font-medium">
            <div>Order ID</div>
            <div>Date</div>
            <div>Items</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Orders List */}
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {orders.map((order) => (
                <div key={order.order_id} className="text-white">
                  {/* Order Summary Row */}
                  <div
                    className="grid grid-cols-5 p-4 cursor-pointer hover:bg-[#343434]"
                    onClick={() => toggleOrderExpansion(order.order_id)}
                  >
                    <div
                      className="font-medium truncate"
                      title={order.order_id}
                    >
                      #{order.order_id.substring(0, 8)}...
                    </div>
                    <div>{formatDate(order.created_at)}</div>
                    <div>{order.items.length} items</div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          order.order_status === "completed"
                            ? "bg-green-900 text-green-400"
                            : "bg-yellow-900 text-yellow-400"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-end">
                      {expandedOrderId === order.order_id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {expandedOrderId === order.order_id && (
                    <div className="bg-[#262626] p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Order Details</h3>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            Last updated: {formatDate(order.updated_at)}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-6">
                        <h4 className="text-gray-400 mb-2">
                          Items in this order:
                        </h4>
                        <div className="bg-[#2D2D2D] rounded-lg divide-y divide-gray-700">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="p-4 flex justify-between"
                            >
                              <div>
                                <p className="text-white">
                                  Item ID: {item.item_id.substring(0, 8)}...
                                </p>
                                <p className="text-gray-400 text-sm">
                                  Quantity: {item.quantity}
                                </p>
                                {item.user_id && (
                                  <p className="text-gray-400 text-sm">
                                    User ID: {item.user_id.substring(0, 8)}...
                                  </p>
                                )}
                                {item.user_ids && item.user_ids.length > 0 && (
                                  <div className="text-gray-400 text-sm">
                                    Users: {item.user_ids.length} users
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="flex justify-between items-center border-t border-gray-700 pt-4">
                        <div>
                          <p className="text-gray-400">
                            Cart ID: {order.cart_id}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          {order.order_status === "pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.order_id, "completed");
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-[#FF8030] to-[#FFA050] hover:from-[#FF7020] hover:to-[#FF9040] text-white font-medium rounded-lg transition-all duration-200"
                            >
                              Mark as Completed
                            </button>
                          )}
                          {order.order_status === "completed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.order_id, "pending");
                              }}
                              className="px-4 py-2 bg-[#3D3D3D] hover:bg-[#4D4D4D] text-white font-medium rounded-lg transition-all duration-200"
                            >
                              Mark as Pending
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

export default OrdersPage;
