"use client";
import React, { useState, useEffect } from "react";
import { User2, Funnel, ShoppingCart } from "lucide-react";
import axios, { AxiosError } from "axios";
import { MenuResponse } from "./types";
import { MenuItem } from "./menu-item";
import Link from "next/link";
import { UserDetails } from "../table/[id]/types";
import { CartResponse } from "../cart/types";

function MenuComponent() {
  const [menuItems, setMenuItems] = useState<MenuResponse[]>([]);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    async function fetchData() {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      ) as UserDetails;
      try {
        const [menuRes, cartRes] = await Promise.all([
          axios.get<MenuResponse[]>(`${process.env.NEXT_PUBLIC_BASEURL}/menu`),
          axios.get<CartResponse[]>(`${process.env.NEXT_PUBLIC_BASEURL}/cart/`),
        ]);

        setMenuItems(menuRes.data);
        setCategories([...new Set(menuRes.data.map((item) => item.category))]);

        const userCart = cartRes.data.find((c) => c.cart_id === user.cart_id);
        setCart(userCart || null);
      } catch (e) {
        console.error(e);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="text-white min-h-screen bg-[#171717]">
      <div className="p-4">
        <div className="text-3xl font-bold flex flex-row items-center justify-between">
          <p>Menu</p>
          <div className="flex flex-row gap-4">
            <User2 />
            <Link href="/cart">
              <ShoppingCart />
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex overflow-x-auto pb-2 whitespace-nowrap">
            <button
              className={`py-2 text-white relative transition-all duration-300 
                ${
                  !activeCategory
                    ? "after:bg-[#D68037]"
                    : "after:bg-transparent"
                } 
                after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] 
                hover:after:bg-[#FFA050]`}
              onClick={() => setActiveCategory(undefined)}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 text-white relative transition-all duration-300  whitespace-nowrap
                  ${
                    activeCategory === category
                      ? "after:bg-[#D68037]"
                      : "after:bg-transparent"
                  } 
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
          {menuItems
            .filter(
              (item) => item.category === activeCategory || !activeCategory
            )
            .map((item, index) => (
              <MenuItem key={index} {...item} cart={cart} setCart={setCart} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default MenuComponent;
