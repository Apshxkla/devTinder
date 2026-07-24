const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Verifies the JWT (from HTTP-only cookie) and attaches req.user
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new ApiError(401, "Please log in to continue.");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired session. Please log in again.");
  }

  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(401, "User belonging to this session no longer exists.");
  }

  req.user = user;
  next();
});

module.exports = { requireAuth };
