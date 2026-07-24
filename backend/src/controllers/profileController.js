const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { validateEditProfileData } = require("../utils/validation");
const ConnectionRequest = require("../models/ConnectionRequest");
const { CONNECTION_STATUS } = require("../utils/constants");

// GET /api/profile/view
const viewProfile = asyncHandler(async (req, res) => {
  const connectionCount = await ConnectionRequest.countDocuments({
    status: CONNECTION_STATUS.ACCEPTED,
    $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }],
  });

  sendSuccess(res, 200, "Profile fetched.", {
    user: req.user,
    connectionCount,
  });
});

// PATCH /api/profile/edit
const editProfile = asyncHandler(async (req, res) => {
  validateEditProfileData(req);

  const allowedFields = ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills", "location"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  await req.user.save();

  sendSuccess(res, 200, "Profile updated successfully.", { user: req.user });
});

module.exports = { viewProfile, editProfile };
