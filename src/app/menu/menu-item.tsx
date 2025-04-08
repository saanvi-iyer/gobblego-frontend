"use client";

import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { MenuResponse } from "./types";
import ItemModal from "./item-view";
import { toast } from "react-toastify";
import axios from "axios";
import { UserDetails } from "../table/[id]/types";
import { CartResponse } from "../cart/types";

interface MenuItemProps extends MenuResponse {
  cart: CartResponse | null;
  setCart: React.Dispatch<React.SetStateAction<CartResponse | null>>;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  cart,
  setCart,
  ...item
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cartItem = cart?.items?.find((i) => i.item_id === item.item_id);
  const quantity = cartItem?.quantity ?? 0;

  const updateQuantity = async (newQty: number) => {
    if (newQty < 0) return;

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    ) as UserDetails;

    const payload = {
      item_id: item.item_id,
      quantity: newQty,
      user_id: user.user_id,
    };
    console.log("Payload:", payload);

    try {
      console.log("Payload:", payload);

      if (newQty === 0 && cartItem) {
        await axios.patch(`${process.env.NEXT_PUBLIC_BASEURL}/cart/`, payload);

        setCart({
          ...cart!,
          items: cart?.items?.filter((i) => i.item_id !== item.item_id) ?? [],
        });

        toast.success(`🗑️ Removed ${item.item_name} from cart`);
      } else if (!cartItem && newQty > 0) {
        await axios.post(`${process.env.NEXT_PUBLIC_BASEURL}/cart/`, payload);

        setCart({
          ...cart!,
          items: [
            ...(cart?.items ?? []),
            {
              item_id: item.item_id,
              item_name: item.item_name,
              price: item.price,
              image: item.images,
              user_id: [user.user_id],
              user_name: [user.user_name],
              quantity: newQty,
            },
          ],
        });

        toast.success(`🛒 Added ${item.item_name} to cart`);
      } else if (cartItem && newQty > 0) {
        await axios.patch(`${process.env.NEXT_PUBLIC_BASEURL}/cart/`, payload);
        console.log("Payload:", payload);

        setCart({
          ...cart!,
          items:
            cart?.items?.map((i) =>
              i.item_id === item.item_id
                ? {
                    ...i,
                    quantity: newQty,
                    user_id: Array.from(new Set([...i.user_id, user.user_id])),
                    user_name: Array.from(
                      new Set([...i.user_name, user.user_name])
                    ),
                  }
                : i
            ) ?? [],
        });

        toast.success(`🔄 Updated ${item.item_name} quantity to ${newQty}`);
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      toast.error("🚨 Failed to update cart. Please try again.");
    }
  };

  return (
    <>
      <div
        key={item.item_id}
        className="relative rounded-lg overflow-hidden bg-[#2D2D2D] shadow-lg cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative h-[300px]">
          <img
            src={`/assets/images/${item.images}`}
            alt={item.item_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 w-full p-4 flex justify-between items-center bg-[#212121]/70 rounded-lg">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-bold">{item.item_name}</div>
            <div className="flex gap-1 items-center text-white text-base font-semibold">
              <span>${item.price.toFixed(2)}</span>
              <span>∙</span>
              <span>{item.est_prep_time} min</span>
            </div>
          </div>

          {quantity > 0 ? (
            <div
              className="flex items-center gap-2 bg-[#FFA050] hover:bg-[#D68037] transition-colors rounded-lg px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => updateQuantity(quantity - 1)}>
                <Minus size={18} color="black" />
              </button>
              <span className="text-black font-semibold">{quantity}</span>
              <button onClick={() => updateQuantity(quantity + 1)}>
                <Plus size={18} color="black" />
              </button>
            </div>
          ) : (
            <button
              className="p-2 bg-[#FFA050] hover:bg-[#D68037] transition-colors rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(1);
              }}
            >
              <Plus size={20} color="black" />
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ItemModal item={item} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
