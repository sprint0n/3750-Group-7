const express = require("express");
const router = express.Router();
const { saveResult, getResultsByName } = require("../db/resultsRepo");

router.post("/save", async (req, res) => {
  const saved = await saveResult(req.body);
  res.json({ success:true, saved });
});

router.get("/:name", async (req, res) => {
  const results = await getResultsByName(req.params.name);
  res.json({ results });
});

module.exports = router;