const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, email, password, age, gender } = req.body;
  const errors = [];

  if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 50) {
    errors.push("First name must be between 2 and 50 characters.");
  }
  if (!lastName || lastName.trim().length < 1 || lastName.trim().length > 50) {
    errors.push("Last name is required.");
  }
  if (!email || !validator.isEmail(email)) {
    errors.push("A valid email is required.");
  }
  if (!password || !validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 0, minNumbers: 1, minSymbols: 0 })) {
    errors.push("Password must be at least 8 characters and include a letter and a number.");
  }
  if (age !== undefined && (isNaN(age) || Number(age) < 18 || Number(age) > 100)) {
    errors.push("Age must be a number between 18 and 100.");
  }
  if (gender && !["male", "female", "other"].includes(String(gender).toLowerCase())) {
    errors.push("Gender must be one of: male, female, other.");
  }

  if (errors.length) {
    const error = new Error(errors.join(" "));
    error.statusCode = 400;
    throw error;
  }
};

const validateEditProfileData = (req) => {
  const allowedFields = ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills", "location"];
  const isValidOperation = Object.keys(req.body).every((field) => allowedFields.includes(field));

  if (!isValidOperation) {
    const error = new Error("Invalid fields in update request.");
    error.statusCode = 400;
    throw error;
  }

  if (req.body.skills && !Array.isArray(req.body.skills)) {
    const error = new Error("Skills must be an array of strings.");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = { validateSignupData, validateEditProfileData };
