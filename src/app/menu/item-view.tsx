"use client";

import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { toast } from "react-toastify";
import { CartItem, MenuItem as MenuItemType } from "../cart/types";
import api from "../api";
import { UserDetails } from "../table/[id]/types";

export default function ItemModal({
  item,
  onClose,
  cart,
  setCart,
}: {
  item: MenuItemType;
  onClose: () => void;
  cart: CartItem[] | null;
  setCart: React.Dispatch<React.SetStateAction<CartItem[] | null>>;
}) {
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (cart) {
      const cartItem = cart.find((ci) => ci.item_id === item.item_id);
      setQuantity(cartItem?.quantity || 0);
    }
  }, [cart, item.item_id]);

  const updateCart = async (newQuantity: number) => {
    try {
      if (typeof window !== "undefined") {
        const user = JSON.parse(
          localStorage.getItem("user") || "{}"
        ) as UserDetails;
        if (!user?.cart_id) {
          toast.error("Please join a table first");
          return;
        }
      }

      const cartItem = cart?.find((ci) => ci.item_id === item.item_id);

      if (cartItem) {
        if (newQuantity > 0) {
          await api.put(`/cart/items/${cartItem.cart_item_id}`, {
            quantity: newQuantity,
            notes: cartItem.notes,
          });
        } else {
          await api.delete(`/cart/items/${cartItem.cart_item_id}`);
        }
      } else if (newQuantity > 0) {
        await api.post("/cart/items", {
          item_id: item.item_id,
          quantity: newQuantity,
          notes: "",
        });
      }

      setQuantity(newQuantity);
      await refetchCart();
      toast.success("Cart updated successfully");
    } catch (error) {
      console.error("Cart operation failed:", error);
      toast.error("Failed to update cart");
    }
  };

  const refetchCart = async () => {
    try {
      const { data } = await api.get<CartItem[]>("/cart/items");
      setCart(data);
    } catch (error) {
      console.error("Cart refresh failed:", error);
      toast.error("Failed to load cart data");
    }
  };

  return (
    <div
      className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#2D2D2D] p-6 rounded-2xl w-11/12 md:w-2/3 lg:w-1/2 shadow-lg text-white flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`/assets/images/${item.images}`}
          alt={item.item_name}
          className="w-full h-64 object-cover rounded-xl"
        />
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{item.item_name}</h2>
          <p className="text-lg text-white">₹{item.price.toFixed(2)}</p>
          <p className="text-sm text-gray-300">{item.description}</p>
          <p className="text-sm text-gray-400">
            Estimated prep time: {item.est_prep_time} min
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            className="bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 rounded-lg text-white"
            onClick={onClose}
          >
            Close
          </button>
          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-[#FFA050] hover:bg-[#D68037] transition-colors rounded-lg px-3 py-1">
              <button onClick={() => updateCart(quantity - 1)}>
                <Minus size={20} color="black" />
              </button>
              <span className="text-black font-semibold">{quantity}</span>
              <button onClick={() => updateCart(quantity + 1)}>
                <Plus size={20} color="black" />
              </button>
            </div>
          ) : (
            <button
              className="p-2 bg-[#FFA050] hover:bg-[#D68037] transition-colors rounded-lg"
              onClick={() => updateCart(1)}
            >
              <Plus size={20} color="black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
