import express from 'express';
//import { addChatMessage, getGameChats } from '../controllers/gameControllers.js';
import {createRoom, addChatMessage,getGameChats,joinGame} from '../controllers/gameControllers.js';
//import { addChatMessage } from './../controllers/gameControllers';
const router = express.Router();

// Route to add a new chat message to a specific game
router.post('/create',createRoom);
router.post('/join',joinGame);
// Corresponds to the POST request in the frontend
router.post('/:gameId/chat', addChatMessage);

// Route to get all chats for a specific game
// Corresponds to the GET request in the frontend
router.get('/:gameId/chats', getGameChats);

export default router;
