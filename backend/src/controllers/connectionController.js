const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/User");
const Message = require("../models/Message");
const { CONNECTION_STATUS, USER_SAFE_FIELDS } = require("../utils/constants");

// POST /api/request/send/:status/:userId
const sendConnectionRequest = asyncHandler(async (req, res) => {
  const fromUserId = req.user._id;
  const { status, userId: toUserId } = req.params;

  if (fromUserId.toString() === toUserId) {
    throw new ApiError(400, "You cannot send a connection request to yourself.");
  }

  const toUser = await User.findById(toUserId);
  if (!toUser) {
    throw new ApiError(404, "User not found.");
  }

  const existingRequest = await ConnectionRequest.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
  });

  if (existingRequest) {
    throw new ApiError(409, "A connection request already exists between these users.");
  }

  const connectionRequest = await ConnectionRequest.create({
    fromUserId,
    toUserId,
    status,
  });

  sendSuccess(res, 201, `Request marked as '${status}' successfully.`, { connectionRequest });
});

// PATCH /api/request/review/:status/:requestId
const reviewConnectionRequest = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;
  const { status, requestId } = req.params;

  const connectionRequest = await ConnectionRequest.findOne({
    _id: requestId,
    toUserId: loggedInUser._id,
    status: CONNECTION_STATUS.INTERESTED,
  });

  if (!connectionRequest) {
    throw new ApiError(404, "No pending connection request found for you to review.");
  }

  connectionRequest.status = status;
  await connectionRequest.save();

  sendSuccess(res, 200, `Connection request ${status}.`, { connectionRequest });
});

// GET /api/request/received
const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await ConnectionRequest.find({
    toUserId: req.user._id,
    status: CONNECTION_STATUS.INTERESTED,
  }).populate("fromUserId", USER_SAFE_FIELDS);

  sendSuccess(res, 200, "Received requests fetched.", { requests });
});

// GET /api/request/sent
const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await ConnectionRequest.find({
    fromUserId: req.user._id,
  }).populate("toUserId", USER_SAFE_FIELDS);

  sendSuccess(res, 200, "Sent requests fetched.", { requests });
});

// GET /api/connections
const getConnections = asyncHandler(async (req, res) => {
  const loggedInUser = req.user;

  const connections = await ConnectionRequest.find({
    status: CONNECTION_STATUS.ACCEPTED,
    $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
  })
    .populate("fromUserId", USER_SAFE_FIELDS)
    .populate("toUserId", USER_SAFE_FIELDS);

  const data = await Promise.all(
    connections.map(async (conn) => {
      const partner =
        conn.fromUserId._id.toString() === loggedInUser._id.toString()
          ? conn.toUserId
          : conn.fromUserId;

      const lastMessage = await Message.findOne({
        $or: [
          { senderId: loggedInUser._id, receiverId: partner._id },
          { senderId: partner._id, receiverId: loggedInUser._id },
        ],
      })
        .sort({ createdAt: -1 })
        .select("text createdAt read senderId");

      const unreadCount = await Message.countDocuments({
        senderId: partner._id,
        receiverId: loggedInUser._id,
        read: false,
      });

      return {
        ...partner.toObject(),
        lastMessage,
        unreadCount,
      };
    })
  );

  sendSuccess(res, 200, "Connections fetched.", { connections: data });
});

module.exports = {
  sendConnectionRequest,
  reviewConnectionRequest,
  getReceivedRequests,
  getSentRequests,
  getConnections,
};
