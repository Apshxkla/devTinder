import { io } from "socket.io-client";

let socket = null;

// Lazily create a single shared socket connection (auth cookie sent automatically)
export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:7777", {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
