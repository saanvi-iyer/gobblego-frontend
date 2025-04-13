"use client";
import React, { useEffect, useState } from "react";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
} from "lucide-react";
import Script from "next/script";
import api from "../api";
import { toast } from "react-toastify";

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
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false); // New loading state

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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}`, {
        status: status,
      });
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
    }
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
        alert("Razorpay SDK failed to load. Please try again later.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert(
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
        color: "#3399cc",
      },
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on("payment.failed", function (response: any) {
      toast.error(`Payment failed: ${response.error.description}`);
    });

    rzp.open();
  };

  const handlePaymentSuccess = async (response: any, paymentId: string) => {
    setIsVerifyingPayment(true); // Start loading
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

      // Refresh orders after successful payment
      fetchOrders();
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`
      );
    } finally {
      setIsVerifyingPayment(false); // End loading
    }
  };

  // Calculate total amount of pending orders
  const pendingOrdersTotal = orders
    .filter((order) => order.status != "completed")
    .reduce((sum, order) => sum + order.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
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

      <div className="p-6 max-w-6xl mx-auto bg-[#212121] min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-6">Order Management</h1>

        {/* Payment Success Message */}
        {paymentSuccess && (
          <div className="bg-green-900 text-green-400 p-6 rounded-xl shadow mb-8">
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p>Payment ID: {paymentDetails?.paymentId}</p>
            <p>Order ID: {paymentDetails?.orderId}</p>
            <p>Amount: ₹{(paymentDetails?.amount).toFixed(2)}</p>
            <button
              onClick={() => setPaymentSuccess(false)}
              className="mt-4 px-4 py-2 bg-green-800 text-green-300 rounded-md hover:bg-green-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Orders Summary */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2D2D2D] p-6 rounded-xl shadow">
            <h3 className="text-white text-lg font-medium mb-2">
              Total Orders
            </h3>
            <p className="text-white text-2xl font-bold">{orders.length}</p>
          </div>

          <div className="bg-[#2D2D2D] p-6 rounded-xl shadow">
            <h3 className="text-white text-lg font-medium mb-2">
              Pending Orders
            </h3>
            <p className="text-yellow-400 text-2xl font-bold">
              {orders.filter((order) => order.status === "pending").length}
            </p>
          </div>

          <div className="bg-[#2D2D2D] p-6 rounded-xl shadow">
            <h3 className="text-white text-lg font-medium mb-2">
              Completed Orders
            </h3>
            <p className="text-green-400 text-2xl font-bold">
              {orders.filter((order) => order.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Checkout Button Section */}
        {pendingOrdersTotal > 0 && (
          <div className="bg-[#2D2D2D] p-6 rounded-xl shadow mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white text-lg font-medium mb-1">
                  Ready to Pay?
                </h3>
                <p className="text-gray-400">
                  Total amount for pending orders: ₹
                  {pendingOrdersTotal.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || isVerifyingPayment}
                className={`flex items-center px-6 py-3 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isCheckingOut || isVerifyingPayment
                    ? "opacity-70 cursor-not-allowed"
                    : ""
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
          </div>
        )}

        {/* Orders List */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">All Orders</h2>

          <div className="bg-[#2D2D2D] rounded-xl shadow overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 p-4 bg-[#3D3D3D] text-white font-medium">
              <div>Order ID</div>
              <div>Date</div>
              <div>Amount</div>
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
                      <div>₹{order.total_amount.toFixed(2)}</div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            order.status === "completed"
                              ? "bg-green-900 text-green-400"
                              : order.status === "payment_initiated"
                              ? "bg-blue-900 text-blue-400"
                              : "bg-yellow-900 text-yellow-400"
                          }`}
                        >
                          {order.status}
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

                        {/* Order Details */}
                        <div className="mb-6">
                          <div className="bg-[#2D2D2D] rounded-lg p-4">
                            <p className="text-white">
                              <span className="text-gray-400">Order ID:</span>{" "}
                              {order.order_id}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-400">Cart ID:</span>{" "}
                              {order.cart_id}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-400">User ID:</span>{" "}
                              {order.user_id}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-400">
                                Total Amount:
                              </span>{" "}
                              ₹{order.total_amount.toFixed(2)}
                            </p>
                            <p className="text-white">
                              <span className="text-gray-400">Created:</span>{" "}
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Order Items - Only show if items are available */}
                        {order.items && order.items.length > 0 && (
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
                                        User ID: {item.user_id.substring(0, 8)}
                                        ...
                                      </p>
                                    )}
                                    {item.user_ids &&
                                      item.user_ids.length > 0 && (
                                        <div className="text-gray-400 text-sm">
                                          Users: {item.user_ids.length} users
                                        </div>
                                      )}
                                  </div>
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
              <div className="p-6 text-center text-gray-400">
                No orders found
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersPage;
