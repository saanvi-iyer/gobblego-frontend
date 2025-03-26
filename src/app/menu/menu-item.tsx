import { Plus } from "lucide-react";
import { MenuResponse } from "./types";

export const MenuItem: React.FC<MenuResponse> = ({
  item_id,
  item_name,
  price,
  is_available,
  category,
  est_prep_time,
  description,
  image,
}) => {
  return (
    <div
      key={item_id}
      className="relative rounded-lg overflow-hidden bg-gray-900 shadow-lg"
    >
      <div className="relative h-48">
        <img
          src={image || "/placeholder.jpg"}
          alt={item_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xl font-semibold bg-black bg-opacity-50 px-4 py-2 rounded">
            {item_name}
          </span>
        </div>
      </div>
      <div className="p-4 flex justify-between items-center bg-[#171717]/50  rounded-lg">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-bold">{item_name}</div>
          <div className="flex gap-1 items-center text-white text-base font-semibold">
            <span>${price.toFixed(2)}</span>
            <span>∙</span>
            <span>{est_prep_time} min</span>
          </div>
        </div>
        <button className=" p-2 bg-[#FFA050]  hover:bg-[#D68037] transition-colors rounded-lg">
          <Plus size={20} color="black" />
        </button>
      </div>
    </div>
  );
};
