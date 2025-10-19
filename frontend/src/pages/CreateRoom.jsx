import React, { useState } from "react";

// NOTE: The following components are assumed to be defined elsewhere and are included here
// for context. They are simple, reusable UI components.

const Button = ({ children, onClick, variant, className = '', disabled, ...props }) => {
  const base = "px-4 py-2 rounded-lg font-semibold text-white shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = variant === 'destructive' ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
  return <button onClick={onClick} className={`${base} ${styles} ${className}`} disabled={disabled} {...props}>{children}</button>;
};

const Input = (props) => <input {...props} className={`p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className}`} />;

const Dialog = ({ open, onOpenChange, children }) => open ? <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={() => onOpenChange(false)}><div className="w-full max-w-md p-4" onClick={e => e.stopPropagation()}>{children}</div></div> : null;

const DialogContent = ({ children, className }) => <div className={`bg-white rounded-lg shadow-xl p-6 ${className}`}>{children}</div>;

const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>;

const DialogTitle = ({ children }) => <h2 className="text-2xl font-bold text-gray-800">{children}</h2>;

const DialogDescription = ({ children }) => <p className="text-sm text-gray-500 mt-1">{children}</p>;

// The main component that was fixed
export default function CreateRoom({ onRoomCreated }) {
  const [open, setOpen] = useState(false);
  const [roomData, setRoomData] = useState({
    name: "",
    numStocks: "15",
    roundTime: "8",
    maxPlayers: "5",
    initialMoney: "500000",
    numRounds: "25"
  });
  const [roomID, setRoomID] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setRoomData({ ...roomData, [field]: value });
  };

  const handleCreate = async () => {
       const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const user_id = storedUser.user_id;
    const full_name = storedUser.full_name || "Player";

    if (!user_id) {
      setError("User not logged in! Please log in to create a room.");
      return;
    }
    // --- Validation Logic ---
    for (const key in roomData) {
      if (!roomData[key]) {
        setError("Please fill all fields!");
        return;
      }
    }
    
    const numStocks = parseInt(roomData.numStocks);
    if (numStocks < 5 || numStocks > 50) {
      setError("Number of stocks must be between 5 and 50");
      return;
    }
    
    setError("");
    
    // --- Room ID Generation ---
    const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    let id = "";
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // --- API Call Logic (Integrated from original code) ---
    setLoading(true);
    try {
      // These would typically come from environment variables or a context

      ///
      const backend_url = "http://localhost:3000"; // Placeholder URL
     // const user_id = ""; // Placeholder user ID

      // This fetch call is for demonstration. In a real app, you'd have your actual backend endpoint.
      console.log("Creating room with data:", { ...roomData, roomID: id, createdBy: user_id });

      // Mocking a successful API call for demonstration purposes
     // await new Promise(resolve => setTimeout(resolve, 1000));
     // const res = { ok: true, json: () => Promise.resolve({ message: "Room created successfully!" }) };

      // Uncomment the following block to use a real fetch call
      console.log(user_id+"just before post");
      const res = await fetch(`${backend_url}/api/game/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomID: id,
          name: roomData.name,
          numStocks: roomData.numStocks,
          roundTime: roomData.roundTime,
          maxPlayers: roomData.maxPlayers,
          initialMoney: roomData.initialMoney,
          numRounds: roomData.numRounds,
          createdBy: user_id,
        }),
      });
      const data = await res.json();
      

      if (res.ok) {
        setRoomID(id); // Set room ID on state to update UI
      } else {
        // setError(data.message || "Failed to create room.");
        setError("Failed to create room. Please try again.");
      }
    } catch (err) {
      console.error("Error creating room:", err);
      setError("A server error occurred while creating the room.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterLobby = () => {
    // Get the current user's ID
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const user_id = storedUser.user_id;

    if (onRoomCreated) {
      // Add the createdBy ID to the room settings object before navigating
      const completeRoomSettings = { ...roomData, createdBy: user_id };
      onRoomCreated(completeRoomSettings, roomID);
    }
    
    setOpen(false);
    // Reset state for the next time the dialog is opened
    setRoomID("");
    setError("");
    setRoomData({
      name: "",
      numStocks: "15",
      roundTime: "8",
      maxPlayers: "5",
      initialMoney: "500000",
      numRounds: "25"
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Game Room</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Game Room</DialogTitle>
            <DialogDescription>Set up your room preferences before starting.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {/* Form Inputs */}
            <div>
              <label className="font-semibold text-gray-700 text-sm">Room Name</label>
              <Input value={roomData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Enter room name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700 text-sm">Stocks (5-50)</label>
                  <Input type="number" min="5" max="50" value={roomData.numStocks} onChange={(e) => handleChange("numStocks", e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 text-sm">Rounds (5-100)</label>
                  <Input type="number" min="5" max="100" value={roomData.numRounds} onChange={(e) => handleChange("numRounds", e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 text-sm">Round Time (s)</label>
                  <Input type="number" min="5" max="60" value={roomData.roundTime} onChange={(e) => handleChange("roundTime", e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 text-sm">Max Players</label>
                  <Input type="number" min="2" max="10" value={roomData.maxPlayers} onChange={(e) => handleChange("maxPlayers", e.target.value)} />
                </div>
            </div>
            <div>
              <label className="font-semibold text-gray-700 text-sm">Initial Money</label>
              <Input type="number" min="10000" value={roomData.initialMoney} onChange={(e) => handleChange("initialMoney", e.target.value)} />
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            {!roomID ? (
              <Button onClick={handleCreate} disabled={loading} className="w-full mt-2">
                {loading ? "Creating..." : "Create Room"}
              </Button>
            ) : (
              <div className="flex flex-col gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-center mt-2">
                <p className="text-green-800 font-medium">
                  Room Created! ID: 
                  <span className="block font-bold text-2xl tracking-widest bg-white px-2 py-1 rounded-md mt-1">{roomID}</span>
                </p>
                <Button onClick={handleEnterLobby} className="w-full">Enter Lobby</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}