"use client";
import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api";
import { CartItem, MenuItem as MenuItemType } from "../cart/types";
import { UserDetails } from "../table/[id]/types";
import ItemModal from "./item-view";

interface MenuItemProps extends MenuItemType {
  cart: CartItem[] | null;
  setCart: React.Dispatch<React.SetStateAction<CartItem[] | null>>;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  cart,
  setCart,
  ...item
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (cart) {
      const cartItem = cart.find((ci) => ci.item_id === item.item_id);
      setQuantity(cartItem?.quantity || 0);
    }
  }, [cart, item.item_id]);

  const updateCart = async (newQuantity: number) => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      ) as UserDetails;
      if (!user?.cart_id) {
        toast.error("Please join a table first");
        return;
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
    <>
      <div
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
              <button onClick={() => updateCart(quantity - 1)}>
                <Minus size={18} color="black" />
              </button>
              <span className="text-black font-semibold">{quantity}</span>
              <button onClick={() => updateCart(quantity + 1)}>
                <Plus size={18} color="black" />
              </button>
            </div>
          ) : (
            <button
              className="p-2 bg-[#FFA050] hover:bg-[#D68037] transition-colors rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                updateCart(1);
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
