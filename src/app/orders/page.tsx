"use client";
import React, { useEffect, useState } from "react";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import Script from "next/script";
import api from "../api";
import { toast } from "react-toastify";
import Link from "next/link";

interface OrderItem {
  item_id: string;
  user_id?: string;
  user_ids?: string[];
  quantity: number;
}

interface Order {
  order_id: string;
  cart_id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

interface PaymentDetails {
  payment_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get<Order[]>(`/orders`);
      setOrders(res.data || []);
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleScriptError = () => {
    console.error("Failed to load Razorpay script");
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await api.post<PaymentDetails>("/orders/checkout", {});
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        openRazorpayCheckout(response.data);
      } else {
        toast.error("Razorpay SDK failed to load. Please try again later.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(
        `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const openRazorpayCheckout = (orderData: PaymentDetails) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "GobbleGo",
      description: "Payment for your order",
      order_id: orderData.razorpay_order_id,
      handler: function (response: any) {
        console.log("Payment response:", response);
        handlePaymentSuccess(response, orderData.payment_id);
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      notes: {
        cart_id: orders[0]?.cart_id || "",
      },
      theme: {
        color: "#FFA050",
      },
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on("payment.failed", function (response: any) {
      toast.error(`Payment failed: ${response.error.description}`);
    });

    rzp.open();
  };

  const handlePaymentSuccess = async (response: any, paymentId: string) => {
    setIsVerifyingPayment(true);
    try {
      const verifyResponse = await api.post("/payments/verify", {
        payment_id: paymentId,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });

      setPaymentSuccess(true);
      setPaymentDetails({
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        amount: pendingOrdersTotal,
      });

      fetchOrders();
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error(
        `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Calculate total amount of pending orders
  const pendingOrdersTotal = orders
    .filter((order) => order.status != "completed")
    .reduce((sum, order) => sum + order.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <Loader2 className="w-10 h-10 mb-4 animate-spin text-[#FFA050]" />
        <span>Loading orders...</span>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onError={handleScriptError}
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-[#212121]">
        <header className="sticky top-0 z-10 bg-[#2D2D2D] shadow-md">
          <div className="p-4 flex items-center gap-3">
            <Link href="/menu" className="text-gray-300 hover:text-[#FFA050]">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-white">Your Orders</h1>
          </div>
        </header>

        <main className="p-4 pb-24">
          {paymentSuccess && (
            <div className="bg-[#2D2D2D] border border-green-700 text-white p-4 rounded-xl mb-6">
              <h2 className="text-xl font-semibold mb-2 text-green-400">
                Payment Successful!
              </h2>
              <p className="text-gray-300">
                Payment ID: {paymentDetails?.paymentId.substring(0, 12)}...
              </p>
              <p className="text-gray-300">
                Order ID: {paymentDetails?.orderId.substring(0, 12)}...
              </p>
              <p className="text-gray-300 mb-4">
                Amount: ₹{(paymentDetails?.amount).toFixed(2)}
              </p>
              <button
                onClick={() => setPaymentSuccess(false)}
                className="w-full py-3 bg-green-800 text-white rounded-lg hover:bg-green-700"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#2D2D2D] p-4 rounded-xl shadow">
              <h3 className="text-gray-400 text-sm mb-1">Total Orders</h3>
              <p className="text-white text-xl font-bold">{orders.length}</p>
            </div>

            <div className="bg-[#2D2D2D] p-4 rounded-xl shadow">
              <h3 className="text-gray-400 text-sm mb-1">Pending</h3>
              <p className="text-[#FFA050] text-xl font-bold">
                {orders.filter((order) => order.status === "pending").length}
              </p>
            </div>
          </div>

          {pendingOrdersTotal > 0 && (
            <div className="bg-[#2D2D2D] p-4 rounded-xl shadow mb-6">
              <h3 className="text-white font-medium mb-1">Ready to Pay?</h3>
              <p className="text-gray-400 text-sm mb-3">
                Total amount: ₹{pendingOrdersTotal.toFixed(2)}
              </p>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || isVerifyingPayment}
                className={`w-full flex justify-center items-center py-3 text-white bg-gradient-to-r from-[#FF8030] to-[#FFA050] rounded-lg ${
                  isCheckingOut || isVerifyingPayment
                    ? "opacity-70"
                    : "hover:from-[#FF7020] hover:to-[#FF9040]"
                }`}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isVerifyingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Your Order History
            </h2>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.order_id}
                    className="bg-[#2D2D2D] rounded-xl overflow-hidden shadow"
                  >
                    <div
                      className="p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleOrderExpansion(order.order_id)}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              order.status === "completed"
                                ? "bg-green-900/50 text-green-400"
                                : order.status === "payment_initiated"
                                ? "bg-blue-900/50 text-blue-400"
                                : "bg-yellow-900/50 text-yellow-400"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {formatDate(order.created_at)}
                          </span>
                        </div>
                        <div className="text-white font-medium">
                          ₹{order.total_amount.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        {expandedOrderId === order.order_id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedOrderId === order.order_id && (
                      <div className="bg-[#262626] p-4 border-t border-gray-700">
                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                          <Clock size={14} />
                          <span>
                            Last updated: {formatDate(order.updated_at)}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm mb-4">
                          <p className="text-gray-300">
                            <span className="text-gray-500">Order ID:</span> #
                            {order.order_id.substring(0, 8)}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-500">Cart ID:</span> #
                            {order.cart_id.substring(0, 8)}
                          </p>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div>
                            <h4 className="text-gray-400 text-xs mb-2">
                              Items in this order:
                            </h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="bg-[#2D2D2D] p-3 rounded-lg text-sm"
                                >
                                  <div className="flex justify-between mb-1">
                                    <p className="text-white">
                                      Item #{item.item_id.substring(0, 6)}
                                    </p>
                                    <p className="text-white font-medium">
                                      x{item.quantity}
                                    </p>
                                  </div>
                                  {item.user_id && (
                                    <p className="text-gray-400 text-xs">
                                      Added by: {item.user_id.substring(0, 8)}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#2D2D2D] p-6 rounded-xl text-center">
                <p className="text-gray-400">No orders found</p>
                <Link href="/menu">
                  <button className="mt-4 px-6 py-3 bg-gradient-to-r from-[#FF8030] to-[#FFA050] text-white font-medium rounded-lg">
                    Browse Menu
                  </button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default OrdersPage;
