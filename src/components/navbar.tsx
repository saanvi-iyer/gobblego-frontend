"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Menu,
  ShoppingCart,
  ClipboardList,
  UserCog,
  Book,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname.includes("/admin") || pathname.includes("/table")) {
    return null;
  }

  const getCartItemCount = () => {
    try {
      const cartData = localStorage.getItem("cartData");
      if (!cartData) return 0;

      const cart = JSON.parse(cartData);
      if (!Array.isArray(cart)) return 0;

      return cart.reduce((total, item) => total + (item.quantity || 0), 0);
    } catch (error) {
      console.error("Error getting cart count:", error);
      return 0;
    }
  };

  const cartCount = getCartItemCount();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#2D2D2D] border-t border-[#3D3D3D] shadow-lg z-50">
      <nav className="flex justify-around items-center">
        <NavItem
          href="/"
          icon={<Home size={22} />}
          label="Home"
          active={pathname === "/"}
        />
        <NavItem
          href="/menu"
          icon={<Book size={22} />}
          label="Menu"
          active={pathname === "/menu" || pathname.startsWith("/menu/")}
        />
        <NavItem
          href="/cart"
          icon={<ShoppingCart size={22} />}
          label="Cart"
          active={pathname === "/cart"}
          badge={cartCount > 0 ? cartCount : undefined}
        />
        <NavItem
          href="/orders"
          icon={<ClipboardList size={22} />}
          label="Orders"
          active={pathname === "/orders"}
        />
      </nav>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
}

function NavItem({ href, icon, label, active, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center py-3 px-3 ${
        active ? "text-[#FFA050]" : "text-gray-400"
      }`}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && (
          <div className="absolute -top-2 -right-2 bg-[#FFA050] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {badge > 99 ? "99+" : badge}
          </div>
        )}
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
      {active && (
        <div className="absolute bottom-0 w-8 h-1 bg-[#FFA050] rounded-t-md"></div>
      )}
    </Link>
  );
}
