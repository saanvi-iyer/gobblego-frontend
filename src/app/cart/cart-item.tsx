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
      } else if (newQty > item.quantity) {
        toast.success(`Added another ${item.item.item_name}`);
      } else {
        toast.success(`Updated ${item.item.item_name} quantity`);
      }
    } catch (error) {
      toast.error("Failed to update cart");
      console.error(error);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden bg-[#2D2D2D] shadow-md">
      <div className="flex gap-3 p-3">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={`/assets/images/${item.item.images}`}
            alt={item.item.item_name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="truncate pr-2">
              <h3 className="text-white font-semibold truncate">
                {item.item.item_name}
              </h3>
              <p className="text-[#FFA050] text-sm mt-0.5">
                ${item.item_price.toFixed(2)}
              </p>
            </div>
            <p className="text-white font-medium text-right whitespace-nowrap">
              ${total}
            </p>
          </div>

          {item.notes && (
            <div className="text-gray-400 text-xs mt-1 italic">
              Note: {item.notes}
            </div>
          )}

          {item.user_id && (
            <div className="text-gray-500 text-xs mt-1">
              Added by: {item.user_id.substring(0, 8)}
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <button
                onClick={() => handleUpdate(0)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex items-center bg-[#3D3D3D] rounded-lg overflow-hidden">
              <button
                onClick={() => handleUpdate(item.quantity - 1)}
                className="p-1.5 text-white hover:bg-[#4D4D4D] transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="px-3 py-1 text-white font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdate(item.quantity + 1)}
                className="p-1.5 text-white hover:bg-[#4D4D4D] transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;
