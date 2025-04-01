import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { CartItem } from "./types";

interface CartItemProps {
  item: CartItem;
  updateQuantity: (item: CartItem, newQuantity: number) => Promise<void>;
}

const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  updateQuantity,
}) => {
  return (
    <div className="p-4 transition-all duration-200 hover:bg-gray-750">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={`/assets/images/${item.image}`}
            alt={item.item_name}
            className="w-20 h-20 object-cover rounded-lg shadow-md"
          />
          <div className="absolute -top-2 -right-2 bg-[#FFA050] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {item.quantity}
          </div>
        </div>

        <div className="flex-1 ml-2">
          <h3 className="text-lg font-semibold text-white">{item.item_name}</h3>
          <p className="text-gray-400 text-sm">Added by: {item.user_name}</p>
          <p className="text-[#FFA050] font-medium mt-1">
            ${item.price.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item, item.quantity - 1)}
              className="p-2 hover:bg-gray-600 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={16} color="white" />
            </button>
            <span className="px-3 text-white">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item, item.quantity + 1)}
              className="p-2 hover:bg-gray-600 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={16} color="white" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-white">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            <button
              onClick={() => updateQuantity(item, 0)}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
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
