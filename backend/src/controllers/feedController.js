const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/User");
const { USER_SAFE_FIELDS } = require("../utils/constants");

// GET /api/feed?page=1&limit=10
// Returns developers the current user has not already interacted with
// (sent/received requests of any status, or self).
const getFeed = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  let limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const existingConnections = await ConnectionRequest.find({
    $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
  }).select("fromUserId toUserId");

  const hiddenUserIds = new Set();
  hiddenUserIds.add(loggedInUser._id.toString());
  existingConnections.forEach((conn) => {
    hiddenUserIds.add(conn.fromUserId.toString());
    hiddenUserIds.add(conn.toUserId.toString());
  });

  const users = await User.find({ _id: { $nin: Array.from(hiddenUserIds) } })
    .select(USER_SAFE_FIELDS)
    .skip((page - 1) * limit)
    .limit(limit);

  sendSuccess(res, 200, "Feed fetched.", { users, page, limit });
});

module.exports = { getFeed };
