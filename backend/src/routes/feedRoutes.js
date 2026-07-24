const express = require("express");
const { getFeed } = require("../controllers/feedController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, getFeed);

module.exports = router;
