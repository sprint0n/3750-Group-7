const { mongoose } = require("./db");

const wordSchema = new mongoose.Schema(
  {
    phrase: { type: String, required: true },
    category: { type: String },
  },
  {
    timestamps: true,
  }
);

const Word = mongoose.model("Word", wordSchema);

async function addWord(phrase, category = null) {
  const word = new Word({ phrase, category });
  await word.save();
  return word;
}

async function getRandomWord() {
  const count = await Word.countDocuments();
  if (count === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * count);
  const word = await Word.findOne().skip(randomIndex).lean();
  return word;
}

module.exports = {
  addWord,
  getRandomWord,
};
