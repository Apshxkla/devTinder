/*
  Seeds the database with sample developers for local testing.
  Run with: npm run seed
*/
require("dotenv").config();
const bcrypt = require("bcrypt");
const connectDB = require("../config/database");
const User = require("../models/User");

const SAMPLE_PASSWORD = "Password123";

const sampleUsers = [
  { firstName: "Ada", lastName: "Lovelace", email: "ada@devtinder.io", age: 28, gender: "female", about: "Algorithms enthusiast. First programmer, still the best.", skills: ["JavaScript", "Python", "Math"], location: "London, UK" },
  { firstName: "Linus", lastName: "Torvalds", email: "linus@devtinder.io", age: 34, gender: "male", about: "I like kernels. And penguins.", skills: ["C", "Linux", "Git"], location: "Portland, USA" },
  { firstName: "Grace", lastName: "Hopper", email: "grace@devtinder.io", age: 30, gender: "female", about: "Compiler builder. Bug hunter (literally).", skills: ["COBOL", "Systems Design"], location: "Arlington, USA" },
  { firstName: "Satoshi", lastName: "N", email: "satoshi@devtinder.io", age: 40, gender: "other", about: "Building decentralized things.", skills: ["Cryptography", "Go", "Rust"], location: "Unknown" },
  { firstName: "Margaret", lastName: "Hamilton", email: "margaret@devtinder.io", age: 33, gender: "female", about: "Software engineering pioneer. Moon landing alum.", skills: ["Software Engineering", "Reliability"], location: "Cambridge, USA" },
  { firstName: "Dennis", lastName: "Ritchie", email: "dennis@devtinder.io", age: 38, gender: "male", about: "C and Unix. That's basically it.", skills: ["C", "Unix", "Compilers"], location: "New Jersey, USA" },
];

const seed = async () => {
  await connectDB();
  console.log("Connected. Seeding...");

  await User.deleteMany({ email: { $in: sampleUsers.map((u) => u.email) } });

  const passwordHash = await bcrypt.hash(SAMPLE_PASSWORD, 10);
  const docs = sampleUsers.map((u) => ({ ...u, password: passwordHash }));

  await User.insertMany(docs);
  console.log(`Seeded ${docs.length} users. All use password: ${SAMPLE_PASSWORD}`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
