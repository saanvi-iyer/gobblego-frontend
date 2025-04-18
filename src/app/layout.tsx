import { ToastContainer, toast } from "react-toastify";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Macondo_Swash_Caps } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/navbar";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const macondoSwashCaps = Macondo_Swash_Caps({
  variable: "--font-mancondo",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "GobbleGo",
  description: "Scan, Order, Repeat!",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${macondoSwashCaps.variable} antialiased bg-black`}
      >
        <CartProvider>
          {children}
          <ToastContainer
            position="top-center"
            autoClose={1500}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"
          />
          <Navbar />
        </CartProvider>
      </body>
    </html>
  );
}
