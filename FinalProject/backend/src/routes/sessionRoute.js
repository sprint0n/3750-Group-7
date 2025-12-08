const express = require("express");
const router = express.Router();
const gameLogic = require("../game/gameLogic");
const sessionManager = require("../game/gameSessionManager");

// Join or create a session
router.post("/join", (req, res) => {
  const { playerId, playerName } = req.body;
  if (!playerId || !playerName)
    return res.status(400).json({ success: false, message: "Missing playerId or playerName" });
  return res.json({ 
        success: true, 
        message: "Player confirmed. Please connect via Socket.IO to start matchmaking." 
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

router.post("/:sessionId/stalemate", (req, res) => {
    const { sessionId } = req.params;

    const session = sessionManager.getSession(sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    // Assuming no move
    const result = gameLogic.handleStalemate(sessionId);

    if (!result.ok) return res.status(400).json({ success: false, message: result.error });

    // Check if the game logic determined a stalemate was reached
    if (result.stalemate) {
        return res.json({ 
            success: true, 
            message: result.message, 
            state: result.state 
        });
    }
    
    // If not a stalemate, reject the request (since a move is available)
    return res.status(400).json({ 
        success: false, 
        message: "Stalemate was not reached. A valid move is still available.",
        state: result.state
    });
});

module.exports = router;