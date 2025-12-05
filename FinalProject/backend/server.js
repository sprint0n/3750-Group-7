const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./src/db/database");

const sessionRoute = require("./src/routes/sessionRoute");
const resultsRoute = require("./src/routes/resultsRoute");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/sessions", sessionRoute);
app.use("/api/results", resultsRoute);

// Socket.IO
require("./socket")(server);

const PORT = 4000;

connectDB().then(() => {
  server.listen(PORT, "0.0.0.0", () =>
    console.log(`Server running on ${PORT} and accessible on LAN`)
  );
}).catch(err => {
  console.error("❌ Failed to connect to MongoDB:", err);
});