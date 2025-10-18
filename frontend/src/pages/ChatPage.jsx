// src/pages/ChatPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { 
  initializeSocket, 
  joinGameChat, 
  leaveGameChat, 
  sendMessage, 
  subscribeToMessages 
} from "../services/chatService";

const backend_url = "http://localhost:3000";

export default function ChatPage({ gameId, chatOpen, setChatOpen }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);

  // --- Fetch existing chats when first opened ---
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${backend_url}/api/game/${gameId}/chats`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch chats");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    if (chatOpen) {
      fetchChats();
      // Initialize socket connection and join game room
      initializeSocket();
      joinGameChat(gameId);
    }

    return () => {
      if (chatOpen) {
        // Leave game room when component unmounts or chat closes
        leaveGameChat(gameId);
      }
    };
  }, [chatOpen, gameId]);

  // --- Subscribe to new messages ---
  useEffect(() => {
    if (!chatOpen) return;

    // Subscribe to new messages
    const unsubscribe = subscribeToMessages((message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      unsubscribe();
    };
  }, [chatOpen]);

  // --- Scroll bottom when new messages ---
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Send message ---
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userString = localStorage.getItem("user");
    if (!userString) {
      alert("User not found. Please login again.");
      return;
    }

    const user = JSON.parse(userString);

    // Send message via WebSocket
    sendMessage(
      gameId,
      user.user_id,
      user.full_name,
      newMessage.trim()
    );

    // Clear input
    setNewMessage("");
  };

  if (!chatOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex justify-end">
      <div className="bg-white w-[400px] h-full flex flex-col p-4 shadow-xl">
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-xl font-bold">Group Chat</h2>
          <button
            onClick={() => setChatOpen(false)}
            className="text-2xl font-bold text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 my-4 border rounded p-2 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-2">
              No messages yet
            </p>
          ) : (
            messages.map((msg, index) => (
              <p key={index} className="mb-2 break-words">
                <strong>{msg.username || msg.user}:</strong> {msg.text}
                {msg.timestamp && (
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </p>
            ))
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <input
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}