"use client";
import React, { useState, useEffect } from "react";
import { User2, ShoppingCart } from "lucide-react";
import Link from "next/link";

import api from "../api";

import { MenuItem } from "./menu-item";
import { CartResponse, MenuResponse } from "../cart/types";

function MenuComponent() {
  const [menuItems, setMenuItems] = useState<MenuResponse>([]);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuRes, cartRes] = await Promise.all([
          api.get<MenuResponse>("/menu"),
          api.get<CartResponse>("/cart/items"),
        ]);

        setMenuItems(menuRes.data);
        setCart(cartRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const filteredMenuItems = activeCategory
    ? menuItems.filter((item) => item.category === activeCategory)
    : menuItems;

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu</h1>
        <div className="flex gap-4">
          <User2 />
          <Link href="/cart">
            <ShoppingCart />
          </Link>
        </div>
      </header>

      <nav className="p-4 flex gap-4 overflow-x-auto whitespace-nowrap">
        <CategoryButton
          label="All"
          isActive={!activeCategory}
          onClick={() => setActiveCategory(undefined)}
        />
        {categories.map((category) => (
          <CategoryButton
            key={category}
            label={category}
            isActive={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          />
        ))}
      </nav>

      <main className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenuItems.map((item) => (
          <MenuItem
            key={item.item_id}
            {...item}
            cart={cart}
            setCart={setCart}
          />
        ))}
      </main>
    </div>
  );
}

type CategoryButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const CategoryButton: React.FC<CategoryButtonProps> = ({
  label,
  isActive,
  onClick,
}) => (
  <button
    className={`px-4 py-2 relative transition-all duration-300 ${
      isActive ? "after:bg-[#D68037]" : "after:bg-transparent"
    } after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] hover:after:bg-[#FFA050]`}
    onClick={onClick}
  >
    {label}
  </button>
);

export default MenuComponent;
