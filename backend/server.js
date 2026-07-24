require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/database");
const initSocket = require("./src/sockets/socketHandler");

const PORT = process.env.PORT || 7777;

const server = http.createServer(app);

// Attach Socket.IO to the same HTTP server
initSocket(server);

connectDB()
  .then(() => {
    console.log("MongoDB connection established.");
    server.listen(PORT, () => {
      console.log(`DevTinder server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
