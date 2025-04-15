"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import api from "../api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface Item {
  item_name: string;
  price: number;
  category: string;
  quantity: number;
}

interface OrderItem {
  item: Item;
  quantity: number;
  price: number;
}

interface Order {
  order_id: string;
  cart_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

const statusOptions = [
  "pending",
  "preparing",
  "ready",
  "payment_failed",
  "payment_initialized",
  "served",
  "completed",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get<Order[]>("/orders/all");
        setOrders(response.data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to fetch orders.");
      }
    };

    void fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setLoadingOrderId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });

      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId ? { ...o, status: newStatus } : o
        )
      );

      toast.success("Status updated successfully!");
    } catch (e) {
      console.error("Failed to update status", e);
      toast.error("Failed to update status.");
    } finally {
      setLoadingOrderId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalOrders = orders.length;
  const totalItemsSold = orders.reduce(
    (count, o) =>
      count + o.order_items.reduce((acc, item) => acc + item.quantity, 0),
    0
  );

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-700 text-white">
          <CardContent className="p-4">
            <p className="text-zinc-400">Total Revenue</p>
            <p className="text-xl font-bold">₹{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700 text-white">
          <CardContent className="p-4">
            <p className="text-zinc-400">Total Orders</p>
            <p className="text-xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700 text-white">
          <CardContent className="p-4">
            <p className="text-zinc-400">Items Sold</p>
            <p className="text-xl font-bold">{totalItemsSold}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="text-white">
        <TabsList className="bg-zinc-800 text-white border-zinc-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-zinc-700">
            All Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Table className="bg-zinc-900 text-white border border-zinc-700 rounded-md">
            <TableHeader className="bg-zinc-800">
              <TableRow>
                <TableCell className="text-zinc-300">Order ID</TableCell>
                <TableCell className="text-zinc-300">Cart ID</TableCell>
                <TableCell className="text-zinc-300">Status</TableCell>
                <TableCell className="text-zinc-300">Total</TableCell>
                <TableCell className="text-zinc-300">Created</TableCell>
                <TableCell className="text-zinc-300">Items</TableCell>
                <TableCell className="text-zinc-300">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell className="text-xs text-zinc-400">
                    {order.order_id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {order.cart_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-600 text-white">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>₹{order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "PPPpp")}
                  </TableCell>
                  <TableCell>
                    <ul className="text-sm list-disc list-inside text-zinc-300">
                      {order.order_items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.item.item_name} (
                          {item.item.category})
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          className="bg-zinc-800 text-white"
                          disabled={loadingOrderId === order.order_id}
                        >
                          {loadingOrderId === order.order_id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              Change Status
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-900 border-zinc-700 text-white">
                        {statusOptions.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() =>
                              updateOrderStatus(order.order_id, status)
                            }
                            className="cursor-pointer hover:bg-zinc-700"
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
