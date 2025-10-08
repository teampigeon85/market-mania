import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog"; // shadcn/ui dialog
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

function generateRoomID(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

const CreateRoom = () => {
  const [open, setOpen] = useState(false);
  const [roomData, setRoomData] = useState({
    name: "",
    numStocks: "",
    roundTime: "",
    maxPlayers: "",
    initialMoney: "",
    numRounds: "",
  });
  const [roomID, setRoomID] = useState("");

  const handleChange = (field, value) => {
    setRoomData({ ...roomData, [field]: value });
  };

  const handleCreate = () => {
    // Check all fields filled
    for (const key in roomData) {
      if (!roomData[key]) {
        alert("Please fill all fields!");
        return;
      }
    }

    const newRoomID = generateRoomID();
    setRoomID(newRoomID);
  };

  const handleEnterGame = () => {
    alert("Entering the game with Room ID: " + roomID);
    // Here you can redirect users or call your game start logic
    setOpen(false); // close popup
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Room</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New Room</DialogTitle>
          <DialogDescription>
            Fill all the fields below to create a room.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Input
            placeholder="Room Name"
            value={roomData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Number of Stocks
            </label>
            <Select
              onValueChange={(val) => handleChange("numStocks", val)}
              value={roomData.numStocks}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number of stocks" />
              </SelectTrigger>
              <SelectContent>
                {[5, 7, 10, 15, 20].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="number"
            placeholder="Time per Round (seconds) - recommended 90s"
            value={roomData.roundTime}
            onChange={(e) => handleChange("roundTime", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Number of Players"
            value={roomData.maxPlayers}
            onChange={(e) => handleChange("maxPlayers", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Initial Money"
            value={roomData.initialMoney}
            onChange={(e) => handleChange("initialMoney", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Number of Rounds"
            value={roomData.numRounds}
            onChange={(e) => handleChange("numRounds", e.target.value)}
          />

          {!roomID ? (
            <Button onClick={handleCreate}>Create Room</Button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-green-600 font-medium">
                Room Created! Your Room ID: <span className="font-bold">{roomID}</span>
              </p>
              <Button onClick={handleEnterGame}>Enter Game</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoom;
