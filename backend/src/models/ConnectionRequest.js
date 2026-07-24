const mongoose = require("mongoose");
const { CONNECTION_STATUS } = require("../utils/constants");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(CONNECTION_STATUS),
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate request pairs and speed up lookups
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre("save", function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    return next(new Error("Cannot send a connection request to yourself."));
  }
  next();
});

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
