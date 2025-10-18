import { io } from 'socket.io-client';

let socket;

export const initializeSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3000', {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }
  return socket;
};

export const joinGameChat = (gameId) => {
  if (!socket) initializeSocket();
  socket.emit('join-game', gameId);
};

export const leaveGameChat = (gameId) => {
  if (socket) socket.emit('leave-game', gameId);
};

export const sendMessage = (gameId, userId, username, text) => {
  if (!socket) initializeSocket();
  socket.emit('send-message', { gameId, userId, username, text });
};

export const subscribeToMessages = (callback) => {
  if (!socket) initializeSocket();
  socket.on('new-message', callback);
  return () => socket.off('new-message', callback);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};