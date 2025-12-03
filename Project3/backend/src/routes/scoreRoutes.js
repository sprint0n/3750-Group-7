const express = require("express");
const router = express.Router();
const { getAllResults } = require("../db/resultsRepo");
const { addWord } = require("../db/wordsRepo");

router.get("/", async (req, res) => {
  try {
    const results = await getAllResults();
    return res.json(results);
  } catch (err) {
    console.error("Error getting scores:", err);
    return res.status(500).json({ error: "Failed to fetch scores." });
  }
});

// TEMP ROUTE: seed 30 simple hangman words into the database
router.post("/seed-words", async (req, res) => {
  try {
    const words = [
      "banana",
      "computer",
      "javascript",
      "python",
      "discus",
      "hammer",
      "college",
      "university",
      "athlete",
      "training",
      "backend",
      "frontend",
      "database",
      "server",
      "socket",
      "network",
      "browser",
      "debugger",
      "variable",
      "function",
      "loop",
      "array",
      "object",
      "promise",
      "chapter",
      "classroom",
      "homework",
      "library",
      "hangman",
      "progress",
    ];

    for (const phrase of words) {
      await addWord(phrase);
    }

    res.json({ message: "30 words seeded successfully." });
  } catch (err) {
    console.error("Error seeding words:", err);
    res.status(500).json({ error: "Failed to seed words." });
  }
});

module.exports = router;
