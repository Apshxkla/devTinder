const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Invalid email address",
      },
    },
    password: { type: String, required: true, select: false, minlength: 8 },
    age: { type: Number, min: 18, max: 100 },
    gender: { type: String, lowercase: true, enum: ["male", "female", "other"] },
    photoUrl: {
      type: String,
      default: "https://api.dicebear.com/7.x/identicon/svg?seed=devtinder",
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Invalid photo URL",
      },
    },
    about: { type: String, maxlength: 500, default: "This developer hasn't written a bio yet." },
    skills: { type: [String], default: [] },
    location: { type: String, trim: true, maxlength: 100, default: "" },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

userSchema.methods.getJWT = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "7d",
  });
};

userSchema.methods.validatePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
