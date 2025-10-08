import React, { useState } from "react";
import { Button } from "../components/ui/button";
import CreateRoom from "./CreateRoom";
const RoomControls = () => {
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = () => {
    console.log("Joining room:", roomCode);
  };

  const handleCreate = () => {
    console.log("Creating new room");
    // add your create room logic here
  };

  return (
    <div className="flex items-center justify-between w-full p-4 bg-gray-50 rounded shadow">
      {/* Left part: Input + Join button */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={handleJoin}>Join Room</Button>
      </div>

      {/* Right part: Create Room button */}
        <CreateRoom />
    </div>
  );
};

export default RoomControls;
