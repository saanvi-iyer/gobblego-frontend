"use client";
import React, { useState, useEffect } from "react";
import { User2, Funnel, ShoppingCart } from "lucide-react";
import axios from "axios";

interface MenuItem {
  item_id: string;
  item_name: string;
  price: number;
  is_available: boolean;
  category: string;
  est_prep_time: number;
  description: string;
  image?: string;
}

function MenuComponent() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    axios.get<MenuItem[]>(`${process.env.NEXT_PUBLIC_BASEURL}/menu`)
      .then(({ data }) => {
        setMenuItems(data);
        setCategories([...new Set(data.map((item) => item.category))]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const url = activeCategory
      ? `${process.env.NEXT_PUBLIC_BASEURL}/menu?category=${encodeURIComponent(activeCategory)}`
      : `${process.env.NEXT_PUBLIC_BASEURL}/menu`;
      
    axios.get<MenuItem[]>(url)
      .then(({ data }) => setMenuItems(data))
      .catch(console.error);
  }, [activeCategory]);

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="p-4">
        <User2 />
        <p className="text-3xl font-bold mb-4">Menu</p>
        <div className="flex items-center gap-4 mb-6">
          <Funnel />
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              className={`px-4 py-2 text-white relative transition-all duration-300 
                ${!activeCategory ? "after:bg-[#D68037]" : "after:bg-transparent"} 
                after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] 
                hover:after:bg-[#FFA050]`}
              onClick={() => setActiveCategory(undefined)}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 text-white relative transition-all duration-300 
                  ${activeCategory === category ? "after:bg-[#D68037]" : "after:bg-transparent"} 
                  after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] 
                  hover:after:bg-[#FFA050]`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map(({ item_id, item_name, price, est_prep_time, image }) => (
            <div key={item_id} className="relative rounded-lg overflow-hidden bg-gray-900 shadow-lg">
              <div className="relative h-48">
                <img src={image || "/placeholder.jpg"} alt={item_name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold bg-black bg-opacity-50 px-4 py-2 rounded">
                    {item_name}
                  </span>
                </div>
                <button className="absolute top-2 right-2 p-2 bg-[#FFA050] rounded-full hover:bg-[#D68037] transition-colors">
                  <ShoppingCart size={20} color="white" />
                </button>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">${price.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">{est_prep_time} min</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MenuComponent;
