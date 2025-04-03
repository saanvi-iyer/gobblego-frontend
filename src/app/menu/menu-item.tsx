"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MenuResponse } from "./types";
import ItemModal from "./item-view";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const MenuItem: React.FC<MenuResponse> = (item) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Item added to cart");
  };

  return (
    <>
      <div
        key={item.item_id}
        className="relative rounded-lg overflow-hidden bg-gray-900 shadow-lg cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative h-[300px]">
          <img
            src={`/assets/images/${item.images}`}
            alt={item.item_name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 w-full p-4 flex justify-between items-center bg-[#171717]/70 rounded-lg">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-bold">{item.item_name}</div>
            <div className="flex gap-1 items-center text-white text-base font-semibold">
              <span>${item.price.toFixed(2)}</span>
              <span>∙</span>
              <span>{item.est_prep_time} min</span>
            </div>
          </div>
          <button
            className="p-2 bg-[#FFA050] hover:bg-[#D68037] transition-colors rounded-lg"
            onClick={addToCart}
          >
            <Plus size={20} color="black" />
          </button>
        </div>
      </div>
      {isModalOpen && (
        <ItemModal item={item} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};