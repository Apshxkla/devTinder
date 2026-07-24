const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/User");
const Message = require("../models/Message");
const { assertConnected } = require("../controllers/messageController");

/*
  Socket.IO event flow
  ---------------------
  1. Client connects with the auth cookie automatically attached (withCredentials).
  2. Server authenticates the socket using the JWT in the cookie (same as REST auth).
  3. Client emits "joinChat" with { targetUserId } to join a private room shared
     by the two users (room id = sorted userId pair).
  4. Client emits "sendMessage" with { targetUserId, text }.
  5. Server validates sender+receiver are accepted connections, persists the
     message to MongoDB, then emits "messageReceived" to everyone in that room.
  6. Server tracks connected userIds in-memory to broadcast "userOnline" /
     "userOffline" presence events.
*/

const onlineUsers = new Map(); // userId -> Set of socket ids

const getRoomId = (userA, userB) => [userA.toString(), userB.toString()].sort().join("_");

const authenticateSocket = async (socket) => {
  const rawCookie = socket.handshake.headers.cookie;
  if (!rawCookie) throw new Error("No auth cookie provided.");

  const parsed = cookie.parse(rawCookie);
  const token = parsed.token;
  if (!token) throw new Error("No token found in cookie.");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id);
  if (!user) throw new Error("User not found.");

  return user;
};

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Unauthorized: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit("userOnline", { userId });

    socket.on("joinChat", ({ targetUserId }) => {
      if (!targetUserId) return;
      const roomId = getRoomId(userId, targetUserId);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ targetUserId, text }, callback) => {
      try {
        if (!targetUserId || !text || !text.trim()) {
          throw new Error("targetUserId and non-empty text are required.");
        }

        await assertConnected(userId, targetUserId);

        const message = await Message.create({
          senderId: userId,
          receiverId: targetUserId,
          text: text.trim(),
        });

        const roomId = getRoomId(userId, targetUserId);
        io.to(roomId).emit("messageReceived", {
          _id: message._id,
          senderId: userId,
          receiverId: targetUserId,
          text: message.text,
          createdAt: message.createdAt,
          read: message.read,
        });

        if (typeof callback === "function") callback({ success: true, message });
      } catch (err) {
        if (typeof callback === "function") callback({ success: false, message: err.message });
      }
    });

    socket.on("typing", ({ targetUserId }) => {
      const roomId = getRoomId(userId, targetUserId);
      socket.to(roomId).emit("typing", { userId });
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("userOffline", { userId });
        }
      }
    });
  });

  return io;
};

module.exports = initSocket;
