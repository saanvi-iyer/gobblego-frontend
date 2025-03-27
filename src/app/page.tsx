"use client";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen bg-black flex flex-col justify-end">
      <div className="absolute text-6xl text-white w-full h-full flex items-center justify-center mb-48 font-mancondo">
        GobbleGo
      </div>
      <Image
        src="/bg.svg"
        alt="alt"
        className="h-fit w-auto"
        width={1000}
        height={1000}
      />
    </div>
  );
}
