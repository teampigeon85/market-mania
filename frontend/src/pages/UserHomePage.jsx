import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, User, BookOpen, Info, Phone, Gamepad2, LogOut } from "lucide-react";

function UserHomePage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col justify-between">
        
        {/* Top Section: Project Logo + Name */}
        <div className="p-4 flex items-center gap-3 border-b">
          <Home className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Market Mania</h2>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <User className="h-5 w-5" />
            Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <BookOpen className="h-5 w-5" />
            Learn
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Info className="h-5 w-5" />
            About Us
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Phone className="h-5 w-5" />
            Contact Us
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Gamepad2 className="h-5 w-5" />
            How to Play
          </Button>
        </div>

        {/* Bottom: Logout */}
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full justify-start gap-2 text-white"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </Sidebar>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Market Mania!
        </h1>
        <p className="text-gray-600">
          Select an option from the sidebar to explore more.
        </p>
      </main>
    </div>
  );
}

export default UserHomePage;
