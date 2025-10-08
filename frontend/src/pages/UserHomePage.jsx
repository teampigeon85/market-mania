import React from "react";
import RoomControls from "./RoomControls";
import { Sidebar } from "../components/ui/sidebar"; // make sure file is Sidebar.jsx
import { Button } from "../components/ui/button";
import { Home, User, BookOpen, Info, Phone, Gamepad2, LogOut } from "lucide-react";
import CreateRoom from "./CreateRoom";
function UserHomePage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-gray-50 flex flex-col gap-6">
        {/* Room Controls: Input + Join + Create */}

        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Market Mania!
          </h1>
          <p className="text-gray-600">
            Select a room from the available rooms by ID or create a new room.
          </p>
        </div>
         <RoomControls />
         
      </main>
    </div>
  );
}

export default UserHomePage;
