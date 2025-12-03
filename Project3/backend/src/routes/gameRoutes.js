const express = require("express");
const router = express.Router();

const GameManager = require("../game/GameManager");
const { getRandomWord } = require("../db/wordsRepo");
const { saveResult } = require("../db/resultsRepo");


async function persistResultsIfDone(session) {
  if (!session.isGameOver()) {
    return;
  }

  // simple guard to not double-save
  if (session._savedToDb) {
    return;
  }

  const results = session.results || [];

  for (const r of results) {
    await saveResult(r);
  }

  session._savedToDb = true;
}

// POST /api/game/:gameId/set-phrase
// body: { mode: 'typed' | 'db', phrase?: string }
router.post("/:gameId/set-phrase", async (req, res) => {
  const { gameId } = req.params;
  const { mode, phrase } = req.body;

  const session = GameManager.getGame(gameId);

  if (!session) {
    return res.status(404).json({ error: "Game session not found." });
  }

  try {
    let finalPhrase;
    let source;

    if (mode === "typed") {
      if (!phrase || typeof phrase !== "string" || !phrase.trim()) {
        return res
          .status(400)
          .json({ error: 'Typed phrase is required when mode is "typed".' });
      }
      finalPhrase = phrase.trim();
      source = "typed";
    } else if (mode === "db") {
      const wordDoc = await getRandomWord();
      if (!wordDoc || !wordDoc.phrase) {
        return res
          .status(500)
          .json({ error: "No words available in database." });
      }
      finalPhrase = wordDoc.phrase;
      source = "db";
    } else {
      return res
        .status(400)
        .json({ error: 'mode must be either "typed" or "db".' });
    }

    session.startRound(finalPhrase, source);

    return res.json({
      gameId,
      round: session.round,
      setter: session.currentSetter,
      guesser: session.currentGuesser,
      state: session.getState(),
    });
  } catch (err) {
    console.error("Error in set-phrase:", err);
    return res.status(500).json({ error: "Failed to start round." });
  }
});


router.post("/:gameId/guess", async (req, res) => {
  const { gameId } = req.params;
  const { letter } = req.body;

  const session = GameManager.getGame(gameId);

  if (!session) {
    return res.status(404).json({ error: "Game session not found." });
  }

  if (!letter || typeof letter !== "string" || letter.length !== 1) {
    return res.status(400).json({ error: "A single letter is required." });
  }

  try {
    session.makeGuess(letter);

    await persistResultsIfDone(session);

    return res.json({
      gameId,
      round: session.round,
      state: session.getState(),
      gameOver: session.isGameOver(),
    });
  } catch (err) {
    console.error("Error in guess:", err);
    return res.status(500).json({ error: "Failed to apply guess." });
  }
});

module.exports = router;
