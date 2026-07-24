const express = require("express");
const { getChatHistory, sendMessage } = require("../controllers/messageController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:userId", requireAuth, getChatHistory);
router.post("/", requireAuth, sendMessage);

module.exports = router;
