const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
const Message = require("../models/Message");
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/User");
const { CONNECTION_STATUS, USER_SAFE_FIELDS } = require("../utils/constants");

// Shared helper: only accepted connections may exchange/read messages
const assertConnected = async (userA, userB) => {
  const connection = await ConnectionRequest.findOne({
    status: CONNECTION_STATUS.ACCEPTED,
    $or: [
      { fromUserId: userA, toUserId: userB },
      { fromUserId: userB, toUserId: userA },
    ],
  });
  if (!connection) {
    throw new ApiError(403, "You can only message accepted connections.");
  }
};

// GET /api/messages/:userId  -> chat history with that user
const getChatHistory = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;
  const { userId } = req.params;

  await assertConnected(loggedInUserId, userId);

  const messages = await Message.find({
    $or: [
      { senderId: loggedInUserId, receiverId: userId },
      { senderId: userId, receiverId: loggedInUserId },
    ],
  }).sort({ createdAt: 1 });

  // Mark messages sent to me as read
  await Message.updateMany(
    { senderId: userId, receiverId: loggedInUserId, read: false },
    { $set: { read: true } }
  );

  const partner = await User.findById(userId).select(USER_SAFE_FIELDS);

  sendSuccess(res, 200, "Chat history fetched.", { messages, partner });
});

// POST /api/messages  { receiverId, text }
// Persists a message via REST (Socket.IO is used for live delivery; this is
// the fallback/history-writing path and is also what the socket handler calls internally).
const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId, text } = req.body;

  if (!receiverId || !text || !text.trim()) {
    throw new ApiError(400, "receiverId and non-empty text are required.");
  }

  await assertConnected(senderId, receiverId);

  const message = await Message.create({ senderId, receiverId, text: text.trim() });

  sendSuccess(res, 201, "Message sent.", { message });
});

module.exports = { getChatHistory, sendMessage, assertConnected };
