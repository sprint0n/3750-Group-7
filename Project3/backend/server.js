// server.js

require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// MongoDB connection
const { connectToDatabase } = require("./src/db/db");

// Routes
const sessionRoutes = require("./src/routes/sessionRoutes");
const gameRoutes = require("./src/routes/gameRoutes");
const scoreRoutes = require("./src/routes/scoreRoutes");

// Socket handler
const setupSocket = require("./src/socket/socketHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Hangman backend running",
  });
});

// Mount API routes
app.use("/api/session", sessionRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/scores", scoreRoutes);

// Create HTTP server
const httpServer = http.createServer(app);

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Load socket.io events
setupSocket(io);

const PORT = process.env.PORT || 4000;

// Connect to MongoDB, then start the server
connectToDatabase().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});
