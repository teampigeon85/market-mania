import React from "react";
import { Button } from "./button"; // shadcn/ui Button
import { Home, User, BookOpen, Info, Phone, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Sidebar = () => {
  const navigate = useNavigate();

  // Frontend-only logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("redirectUrl");
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-white shadow-md p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Market Mania</h2>

      <Button variant="ghost" className="flex items-center gap-2 mb-2">
        <Home size={18} /> Profile
      </Button>
      <Button variant="ghost" className="flex items-center gap-2 mb-2">
        <User size={18} /> Learn
      </Button>
      <Button variant="ghost" className="flex items-center gap-2 mb-2">
        <BookOpen size={18} /> About Us
      </Button>
      <Button variant="ghost" className="flex items-center gap-2 mb-2">
        <Info size={18} /> Contact Us
      </Button>
      <Button variant="ghost" className="flex items-center gap-2 mb-2">
        <Phone size={18} /> How to Play
      </Button>

      <Button
        variant="ghost"
        className="flex items-center gap-2 mt-auto"
        onClick={handleLogout}
      >
        <LogOut size={18} /> Logout
      </Button>
    </div>
  );
};
