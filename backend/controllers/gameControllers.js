import { sql } from "../config/initailiseDatabase.js";

export const createRoom = async (req, res) => {
  try {

    const {
      roomID,
      name: room_name,
      numStocks,
      roundTime,
      maxPlayers,
      initialMoney,
      numRounds,
      createdBy, // user_id of the creator
    } = req.body;
    console.log(roomID+"from backend");
    if (!roomID || !room_name || !numStocks || !roundTime || !maxPlayers || !initialMoney || !numRounds || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }
console.log("ALL filelds corect");
    // ✅ Check if creator exists
    const userExists = await sql`SELECT * FROM users WHERE user_id = ${createdBy}`;
    if (userExists.length === 0) {
      return res.status(400).json({ message: "Creator user does not exist" });
    }

    // 1️⃣ Insert into game_rooms
    await sql`
      INSERT INTO game_rooms 
        (room_id, room_name, num_stocks, round_time, max_players, initial_money, num_rounds, created_by) 
      VALUES 
        (${roomID}, ${room_name}, ${numStocks}, ${roundTime}, ${maxPlayers}, ${initialMoney}, ${numRounds}, ${createdBy})
    `;

    // 2️⃣ Insert into games table so participants can be added
    await sql`
      INSERT INTO games (game_id, created_by_user_id, max_participants)
      VALUES (${roomID}, ${createdBy}, ${maxPlayers})
    `;

    // 3️⃣ Add creator to participants
    await sql`
      INSERT INTO game_participants (game_id, user_id) 
      VALUES (${roomID}, ${createdBy})
    `;

    res.status(201).json({ success: true, roomID, message: "Room created successfully" });
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ success: false, message: "Server error while creating room" });
  }
};
// ✅ Join an existing room
export const joinGame = async (req, res) => {
  try {
    const { roomID, userId } = req.body;

    if (!roomID || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Check if room exists
    const rooms = await sql`SELECT * FROM game_rooms WHERE room_id = ${roomID}`;
    if (rooms.length === 0) {
      return res.status(404).json({ exists: false, message: "Room not found" });
    }

    // 2️⃣ Add user to participants if not already
    const participantCheck = await sql`
      SELECT * FROM game_participants 
      WHERE game_id = ${roomID} AND user_id = ${userId}
    `;
    if (participantCheck.length === 0) {
      await sql`
        INSERT INTO game_participants (game_id, user_id) 
        VALUES (${roomID}, ${userId})
      `;
    }

    // 3️⃣ Extract formatted data
    const room = rooms[0];
    const roomData = {
      createdBy: room.created_by,
      initialMoney: String(room.initial_money),
      maxPlayers: String(room.max_players),
      name: room.room_name,
      numRounds: String(room.num_rounds),
      numStocks: String(room.num_stocks),
      roomID: room.room_id,
      roundTime: String(room.round_time)
    };

    // ✅ Respond in frontend-compatible format
    res.status(200).json({
      exists: true,
      roomData
    });

  } catch (err) {
    console.error("Error joining room:", err);
    res.status(500).json({ message: "Server error while joining room" });
  }
};


// ✅ Add chat message to a game
export const addChatMessage = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId, username, text: message } = req.body;

    if (!gameId || !userId || !username || !message) {
      return res.status(400).json({ error: "Missing required fields from body." });
    }

    await sql`
      INSERT INTO game_chats (game_id, user_id, username, message) 
      VALUES (${gameId}, ${userId}, ${username}, ${message})
    `;

    res.status(201).json({ success: true, message: "Message added successfully." });
  } catch (error) {
    console.error("Error in addChatMessage:", error);
    res.status(500).json({ error: "Internal Server Error: Failed to add message." });
  }
};

// ✅ Get all chat messages for a game
export const getGameChats = async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!gameId) {
      return res.status(400).json({ error: "Game ID is required." });
    }

    const chats = await sql`
      SELECT username AS user, message AS text 
      FROM game_chats 
      WHERE game_id = ${gameId} 
      ORDER BY created_at ASC
    `;

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error in getGameChats:", error);
    res.status(500).json({ error: "Internal Server Error: Failed to fetch chats." });
  }
};