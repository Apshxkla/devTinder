const express = require("express");
const {
  sendConnectionRequest,
  reviewConnectionRequest,
  getReceivedRequests,
  getSentRequests,
  getConnections,
} = require("../controllers/connectionController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validateSendStatus, validateReviewStatus } = require("../middleware/validationMiddleware");

const requestRouter = express.Router();
requestRouter.post("/send/:status/:userId", requireAuth, validateSendStatus, sendConnectionRequest);
requestRouter.patch("/review/:status/:requestId", requireAuth, validateReviewStatus, reviewConnectionRequest);
requestRouter.get("/received", requireAuth, getReceivedRequests);
requestRouter.get("/sent", requireAuth, getSentRequests);

const connectionsRouter = express.Router();
connectionsRouter.get("/", requireAuth, getConnections);

module.exports = { requestRouter, connectionsRouter };
