const bcrypt = require("bcrypt");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
const { validateSignupData } = require("../utils/validation");

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: (Number(process.env.COOKIE_EXPIRY_DAYS) || 7) * 24 * 60 * 60 * 1000,
});

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  validateSignupData(req);
  const { firstName, lastName, email, password, age, gender, photoUrl, about, skills, location } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: passwordHash,
    age,
    gender,
    photoUrl,
    about,
    skills,
    location,
  });

  const token = user.getJWT();
  res.cookie("token", token, cookieOptions());

  sendSuccess(res, 201, "Account created successfully.", { user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = user.getJWT();
  res.cookie("token", token, cookieOptions());

  sendSuccess(res, 200, "Logged in successfully.", { user });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", null, { ...cookieOptions(), maxAge: 0 });
  sendSuccess(res, 200, "Logged out successfully.");
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Authenticated user fetched.", { user: req.user });
});

module.exports = { signup, login, logout, getMe };
