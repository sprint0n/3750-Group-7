const { mongoose } = require("./db");

const resultSchema = new mongoose.Schema(
  {
    playerName: { type: String, required: true },
    phrase: { type: String, required: true },
    numGuesses: { type: Number, required: true },
    source: { type: String, enum: ["typed", "db"], required: true },
    success: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model("Result", resultSchema);

async function saveResult(resultData) {
  const result = new Result(resultData);
  await result.save();
  return result;
}

async function getAllResults() {
  return Result.find().sort({ createdAt: -1 }).lean();
}

module.exports = {
  saveResult,
  getAllResults,
};
