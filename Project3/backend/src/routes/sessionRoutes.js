const express = require("express");
const router = express.Router();
const GameManager = require("../game/GameManager");

router.post("/create", (req, res) => {
  const { player1Name, player2Name } = req.body;

  if (!player1Name || !player2Name) {
    return res
      .status(400)
      .json({ error: "Both player1Name and player2Name are required." });
  }

  const { id, session } = GameManager.createGame(player1Name, player2Name);

  return res.status(201).json({
    gameId: id,
    player1Name: session.player1,
    player2Name: session.player2,
    state: session.getState(),
  });
});

// GET /api/session/:gameId
// returns current session state
router.get("/:gameId", (req, res) => {
  const { gameId } = req.params;
  const session = GameManager.getGame(gameId);

  if (!session) {
    return res.status(404).json({ error: "Game session not found." });
  }

  return res.json({
    gameId,
    state: session.getState(),
  });
});

module.exports = router;
