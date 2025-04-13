// app/menu/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import api from "../api";
import { MenuItem } from "./menu-item";
import { MenuResponse } from "../cart/types";

function MenuComponent() {
  const { cart, setCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuResponse>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const menuRes = await api.get<MenuResponse>("/menu");
        setMenuItems(menuRes.data);

        const uniqueCategories = Array.from(
          new Set(menuRes.data.map((item) => item.category))
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter menu items by both category and search query
  const filteredMenuItems = menuItems
    .filter((item) => !activeCategory || item.category === activeCategory)
    .filter(
      (item) =>
        searchQuery === "" ||
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      <header className="sticky top-0 z-10 bg-[#212121] shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-center">Menu</h1>
        </div>
        <div className="px-4 pb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#3D3D3D] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA050]"
            />
            <Search className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <nav className="px-1 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-4 pt-2">
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
      </header>

      <main className="p-4 pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFA050]"></div>
          </div>
        ) : filteredMenuItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredMenuItems.map((item) => (
              <MenuItem
                key={item.item_id}
                {...item}
                cart={cart}
                setCart={setCart}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-xl mb-2">No items found</p>
            <p className="text-gray-400">
              Try changing your search or category filter
            </p>
          </div>
        )}
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
    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
      isActive
        ? "bg-[#FFA050] text-black font-medium"
        : "bg-[#3D3D3D] text-white hover:bg-[#4D4D4D]"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

export default MenuComponent;
