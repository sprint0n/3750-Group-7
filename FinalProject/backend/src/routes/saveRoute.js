//This has the get and call from the database for game results
const express = require("express");
const { saveGameResult, getGameResultsName } = require("../database");
const router = express.Router();

router.post("/submit", async (req, res) => {
    const { playerName, result, cardLeft } = req.body;
    try {
        await saveGameResult(playerName, result, cardLeft);
        res.status(200).json({ message: "Game result saved successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save game result" });
    }
});

router.get("/results/:playerName", async (req, res) => {
    const playerName = req.params.playerName;
    try {
        const results = await getGameResultsName(playerName);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve game results" });
    }
});

module.exports = router;