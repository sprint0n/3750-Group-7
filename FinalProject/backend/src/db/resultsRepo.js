const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  playerName: String,
  won: Boolean,
  loserCards: Number,
  date: { type: Date, default: Date.now }
});

const Result = mongoose.model("Result", resultSchema);

module.exports = {
  async saveResult(result) {
    const saved = await Result.create(result);
    return saved;
  },

  async getResultsByName(name) {
    return Result.find({ playerName: name }).sort({ date: -1 });
  }
};