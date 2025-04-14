"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import api from "@/app/api";
import { CartItem } from "@/app/cart/types";

interface CartContextType {
  cart: CartItem[] | null;
  setCart: React.Dispatch<React.SetStateAction<CartItem[] | null>>;
  totalItems: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[] | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    refreshCart();
    const intervalId = setInterval(refreshCart, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (cart) {
      const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
      setTotalItems(itemCount);
      if (typeof window !== "undefined") {
        localStorage.setItem("cartData", JSON.stringify(cart));
      }
    }
  }, [cart]);

  const refreshCart = async () => {
    try {
      const { data } = await api.get<CartItem[]>("/cart/items");
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, totalItems, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
