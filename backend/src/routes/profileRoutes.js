const express = require("express");
const { viewProfile, editProfile } = require("../controllers/profileController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/view", requireAuth, viewProfile);
router.patch("/edit", requireAuth, editProfile);

module.exports = router;
