"use client";
import Image from "next/image";
import { Macondo_Swash_Caps } from "next/font/google";

const macondoSwashCaps = Macondo_Swash_Caps({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  return (
    <div className="h-screen bg-black flex flex-col justify-end">
      <p
        className={`absolute ${macondoSwashCaps.className} text-6xl text-white `}
      >
        ikigai
      </p>
      <div className="w-full h-full">
        <Image
          src="/bg.svg"
          alt=""
          className="h-fit w-auto bg-white"
          width={1000}
          height={1000}
        />
      </div>
    </div>
  );
}
