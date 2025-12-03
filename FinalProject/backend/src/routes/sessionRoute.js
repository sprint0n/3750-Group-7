const express = require("express");
const router = express.Router();
const gameLogic = require("../game/gameLogic");
const sessionManager = require("../game/gameSessionManager");

// Join or create a session
router.post("/join", (req, res) => {
  const { playerId, playerName } = req.body;
  if (!playerId || !playerName)
    return res.status(400).json({ success: false, message: "Missing playerId or playerName" });

  const match = sessionManager.matchPlayer({ id: playerId, name: playerName });

  if (!match) {
    return res.json({ success: true, message: "Waiting for another player..." });
  }

  const { session, p1, p2 } = match;
  gameLogic.startGame(session);

  res.json({
    success: true,
    sessionId: session.id,
    players: session.players,
    state: session.state
  });
});

// Get session state
router.get("/:sessionId", (req, res) => {
  const session = sessionManager.getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ success: false, message: "Session not found" });
  res.json({ success: true, state: session.state });
});

// Handle player move
router.post("/:sessionId/move", (req, res) => {
  const { sessionId } = req.params;
  const { playerId, card, pileSide } = req.body;

  const session = sessionManager.getSession(sessionId);
  if (!session) return res.status(404).json({ success: false, message: "Session not found" });

  const result = gameLogic.handleMove({ sessionId, playerId, card, pileSide });
  if (!result.ok) return res.status(400).json({ success: false, message: result.error });

  res.json({ success: true, ...result });
});

module.exports = router;