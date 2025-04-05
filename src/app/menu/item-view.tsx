"use client";

import { MenuResponse } from "./types";

export default function ItemModal({
  item,
  onClose,
}: {
  item: MenuResponse;
  onClose: () => void;
}) {
  return (
    <div
      className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#2D2D2D] p-6 rounded-2xl w-4/5 shadow-lg text-white flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold">{item.item_name}</h2>
        <p className="text-gray-300">{item.description}</p>
        <button
          className="mt-2 bg-[#FFA050] hover:bg-[#D68037] transition-colors px-4 py-2 rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
