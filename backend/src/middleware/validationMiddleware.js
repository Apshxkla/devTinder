const { SEND_ACTIONS, REVIEW_ACTIONS } = require("../utils/constants");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const validateSendStatus = (req, res, next) => {
  const { status, userId } = req.params;
  if (!SEND_ACTIONS.includes(status)) {
    return next(new ApiError(400, `Invalid status type: ${status}`));
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new ApiError(400, "Invalid user id."));
  }
  next();
};

const validateReviewStatus = (req, res, next) => {
  const { status, requestId } = req.params;
  if (!REVIEW_ACTIONS.includes(status)) {
    return next(new ApiError(400, `Invalid status type: ${status}`));
  }
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return next(new ApiError(400, "Invalid request id."));
  }
  next();
};

module.exports = { validateSendStatus, validateReviewStatus };
