"use client";
import { ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserDetails } from "./types";
import api from "@/app/api";

type User = {
  user_id: string;
  user_name: string;
  is_leader: boolean;
};

export default function Table() {
  const [userName, setUserName] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    api.get(`/users/${params.id}`).then((res) => setMembers(res.data));
  }, [params.id]);

  const joinTable = async () => {
    if (!userName.trim()) {
      toast.error("Please enter a username");
      return;
    }
    try {
      if (typeof window !== "undefined") {
        const response = await api.post<UserDetails>(`/users/`, {
          cart_id: params.id,
          user_name: userName.trim(),
        });
        localStorage.setItem("user", JSON.stringify(response.data));
        router.push("/menu");
      }
    } catch (e) {
      toast.error("Error joining table");
      return;
    }
  };

  return (
    <div className="bg-[#212121] min-h-screen text-white flex flex-col items-center p-8">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="text-[#FFA050] hover:text-[#D68037] transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold mb-6 mt-4">Join Table</h1>
        <div className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="p-3 bg-[#383433] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA050]"
            placeholder="Enter username"
          />
          <button
            onClick={joinTable}
            className="bg-[#FFA050] hover:bg-[#D68037] text-[#212121] font-bold py-3 px-4 rounded-md transition-colors"
          >
            Join Table
          </button>
        </div>
        <div className="bg-[#383433] rounded-md overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-[#656567]">
            Table Members
          </h2>
          {members.map((member) => (
            <div
              key={member.user_id}
              className="flex justify-between p-4 border-b border-[#656567] last:border-b-0"
            >
              <span>{member.user_name}</span>
              <span
                className={`badge px-2 py-1 rounded-full text-xs ${
                  member.is_leader
                    ? "bg-[#FFA050] text-[#212121]"
                    : "bg-[#656567]"
                }`}
              >
                {member.is_leader ? "Leader" : "Member"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
