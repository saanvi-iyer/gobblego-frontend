"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-end relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.svg')" }}
      />
      <div className="absolute text-[#FFA050] w-full h-full mb-4 flex flex-col items-center justify-center gap-y-6">
        <p className="font-giaza text-7xl">gobblego</p>
        <div className="text-[#b99a7e] font-semibold text-lg tracking-widest">Scan. Order. Repeat.</div>
      </div>
      
    </div>
  );
}
