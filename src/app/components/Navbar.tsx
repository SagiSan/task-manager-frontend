"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setLoading(true);
    const response = await logoutUser();
    setLoading(false);

    if (response.success) {
      router.push("/login");
    } else {
      alert(response.message);
    }
  };

  return (
    <nav className="w-full h-16 bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold">Task Manager</h1>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center space-x-2 text-white focus:outline-none"
        >
          <FaUserCircle className="text-3xl hover:text-gray-400 transition" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 shadow-lg rounded-lg overflow-hidden">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition"
              disabled={loading}
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
