const express = require("express");
const router = express.Router();
const gameSession = require("../game/gameSession");

// Get all sessions
router.get("/", (req, res) => {
  res.json({
    success: true,
    sessions: gameSession.sessions
  });
});

// Get a specific session
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const session = gameSession.getSession(id);
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  res.json({ success: true, session });
});

// End/delete a session
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  gameSession.deleteSession(id);

  res.json({ success: true, message: "Session removed" });
});

module.exports = router;