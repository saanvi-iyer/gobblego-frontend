"use client";

import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { CartItem } from "./types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CartItemProps {
  item: CartItem;
  updateQuantity: (item: CartItem, newQuantity: number) => Promise<void>;
}

const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  updateQuantity,
}) => {
  const total = (item.item_price * item.quantity).toFixed(2);

  const handleUpdate = async (newQty: number) => {
    try {
      await updateQuantity(item, newQty);

      if (newQty === 0) {
        toast.info(`${item.item.item_name} removed from cart`);
      } else {
        toast.success(`${item.item.item_name} quantity updated to ${newQty}`);
      }
    } catch (error) {
      toast.error("Failed to update cart");
      console.error(error);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#2D2D2D] shadow-md">
      <div className="flex items-center gap-4 p-4">
        <img
          src={`/assets/images/${item.item.images}`}
          alt={item.item.item_name}
          className="w-16 h-16 object-cover rounded-lg shadow"
        />

        <div className="flex-1">
          <div className="text-white font-semibold text-base">
            {item.item.item_name}
          </div>
          <div className="text-gray-400 text-sm">
            {item.user_id && (
              <span>Added by user {item.user_id.substring(0, 8)}</span>
            )}
          </div>
          <div className="text-[#FFA050] text-sm mt-1">
            ${item.item_price.toFixed(2)}
          </div>
          {item.notes && (
            <div className="text-gray-400 text-sm italic mt-1">
              Note: {item.notes}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center bg-[#FFA050] hover:bg-[#D68037] transition-colors rounded-lg px-2 py-1">
            <button onClick={() => handleUpdate(item.quantity - 1)}>
              <Minus size={16} color="black" />
            </button>
            <span className="px-2 text-black font-semibold">
              {item.quantity}
            </span>
            <button onClick={() => handleUpdate(item.quantity + 1)}>
              <Plus size={16} color="black" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-white font-semibold">${total}</p>
            <button
              onClick={() => handleUpdate(0)}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-full"
              aria-label="Remove item"
            >
              <Trash2 size={16} color="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;
