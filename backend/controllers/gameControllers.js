import { sql } from '../config/initailiseDatabase.js';

export const addChatMessage = async (req, res) => {
  try {
    const { gameId } = req.params;

    // --- CHANGE ---
    // Get user details from the request body sent by the frontend
    const { userId, username, text: message } = req.body;

    if (!gameId || !userId || !username || !message) {
      return res.status(400).json({ error: 'Missing required fields from body.' });
    }

    await sql`
      INSERT INTO game_chats (game_id, user_id, username, message) 
      VALUES (${gameId}, ${userId}, ${username}, ${message})
    `;

    res.status(201).json({ success: true, message: 'Message added successfully.' });
  } catch (error) {
    console.error('Error in addChatMessage:', error);
    res.status(500).json({ error: 'Internal Server Error: Failed to add message.' });
  }
};

export const getGameChats = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required.' });
    }

    const chats = await sql`
      SELECT 
        username AS user, 
        message AS text 
      FROM game_chats 
      WHERE game_id = ${gameId} 
      ORDER BY created_at ASC
    `;

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error in getGameChats:', error);
    res.status(500).json({ error: 'Internal Server Error: Failed to fetch chats.' });
  }
};