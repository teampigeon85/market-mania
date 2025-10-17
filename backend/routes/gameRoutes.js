import express from 'express';
import { addChatMessage, getGameChats } from '../controllers/gameControllers.js';

const router = express.Router();

// Route to add a new chat message to a specific game
// Corresponds to the POST request in the frontend
router.post('/:gameId/chat', addChatMessage);

// Route to get all chats for a specific game
// Corresponds to the GET request in the frontend
router.get('/:gameId/chats', getGameChats);

export default router;
