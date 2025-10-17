import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// --- Helper Components ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children }) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-semibold tracking-tight">{children}</h3>;
const CardContent = ({ children, className = '' }) => <div className={`p-4 ${className}`}>{children}</div>;

const backend_url = 'http://localhost:3000';

export default function GameArena() {
  const { gameId } = useParams();
  const [round, setRound] = useState(1);
  const [quantity, setQuantity] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const stocks = [
    { name: "Apple", pe: 28, liabilities: "High" },
    { name: "Tesla", pe: 35, liabilities: "Medium" },
    { name: "Microsoft", pe: 30, liabilities: "Low" },
  ];

  useEffect(() => {
    let intervalId;
    const fetchChats = async () => {
      try {
        const response = await fetch(`${backend_url}/api/game/${gameId}/chats`, {
        // FIX: This option tells the browser to never use a cached version
        // and always fetch the latest data from the server.
        cache: 'no-store'
      });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const allMessages = await response.json();
        setMessages(allMessages);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    if (chatOpen) {
      fetchChats();
      intervalId = setInterval(fetchChats, 1000);
    }

    return () => clearInterval(intervalId);
  }, [chatOpen, gameId]);

  const handleQuantityChange = (stock, val) => {
    setQuantity({ ...quantity, [stock]: val });
  };

  const handleBuy = (stock) => {
    alert(`Buying ${quantity[stock] || 0} of ${stock}`);
  };

  const handleSell = (stock) => {
    alert(`Selling ${quantity[stock] || 0} of ${stock}`);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      // Get the user object from localStorage
      const userString = localStorage.getItem('user');
      if (!userString) {
        alert('Could not find user in localStorage. Please log in again.');
        return;
      }
      const user = JSON.parse(userString);

      await fetch(`${backend_url}/api/game/${gameId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // --- CHANGE ---
        // Send user details from localStorage in the request body
        body: JSON.stringify({
          text: newMessage,
          userId: user.user_id,
          username: user.full_name
        }),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Error: Could not send message.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* (Rest of your JSX is unchanged) */}
      <aside className="w-64 p-4 bg-white border-r border-gray-200 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-4">MarketMania</h2>
        <p className="text-gray-600 mb-4">Round: {round}</p>
        {stocks.map((stock) => (
          <Card key={stock.name} className="mb-2">
            <CardHeader><CardTitle>{stock.name}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">PE: {stock.pe}</p>
              <p className="text-sm text-gray-500">Liabilities: {stock.liabilities}</p>
              <div className="flex gap-2 mt-2">
                <input type="number" placeholder="Qty" className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm" value={quantity[stock.name] || ""} onChange={(e) => handleQuantityChange(stock.name, e.target.value)} />
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700" onClick={() => handleBuy(stock.name)}>Buy</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700" onClick={() => handleSell(stock.name)}>Sell</button>
              </div>
            </CardContent>
          </Card>
        ))}
        <button className="mt-auto w-full px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">My Holdings</button>
        <p className="mt-2 text-gray-700 font-semibold">Current Money: $10,000</p>
      </aside>
      <main className="flex-1 p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Notices</h2>
        <div className="h-96 border rounded p-4 bg-white overflow-y-auto">
          <p>- Market opens at 9 AM</p>
        </div>
      </main>
      <button onClick={() => setChatOpen(true)} className="fixed right-4 bottom-4 z-50 px-4 py-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900">Chat</button>
      {chatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex justify-end">
          <div className="bg-white w-[400px] h-full flex flex-col p-4 shadow-xl">
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-xl font-bold">Group Chat</h2>
              <button onClick={() => setChatOpen(false)} className="text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <div className="flex-1 my-4 border rounded p-2 overflow-y-auto">
              {messages.map((msg, index) => (
                <p key={index} className="mb-2"><strong>{msg.user}:</strong> {msg.text}</p>
              ))}
            </div>
            <div className="flex gap-2 mt-auto">
              <input placeholder="Type a message..." className="flex-1 border border-gray-300 rounded-md px-3 py-2" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
              <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}