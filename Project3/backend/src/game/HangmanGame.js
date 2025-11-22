class HangmanGame {
  constructor(phrase, maxWrong = 6) {
    this.secret = phrase.toLowerCase();
    this.maxWrong = maxWrong;
    this.guessedLetters = new Set();
    this.wrongGuesses = new Set();
    this.status = "playing"; // "playing", "won", "lost"
  }

  guess(letter) {
    if (this.status !== "playing") return;

    letter = letter.toLowerCase();

    // Ignore guesses already attempted
    if (this.guessedLetters.has(letter) || this.wrongGuesses.has(letter)) {
      return;
    }

    // Correct guess
    if (this.secret.includes(letter)) {
      this.guessedLetters.add(letter);

      if (this._isWordFullyRevealed()) {
        this.status = "won";
      }
    }
    // Wrong guess
    else {
      this.wrongGuesses.add(letter);

      if (this.wrongGuesses.size >= this.maxWrong) {
        this.status = "lost";
      }
    }
  }

  _isWordFullyRevealed() {
    for (const ch of this.secret) {
      if (/[a-z]/.test(ch) && !this.guessedLetters.has(ch)) {
        return false;
      }
    }
    return true;
  }

  getMaskedPhrase() {
    let result = "";

    for (const ch of this.secret) {
      if (!/[a-z]/.test(ch)) {
        result += ch; // just keep visibility
      } else if (this.guessedLetters.has(ch)) {
        result += ch;
      } else {
        result += "_";
      }
    }

    return result;
  }

  getState() {
    return {
      maskedPhrase: this.getMaskedPhrase(),
      wrongGuesses: Array.from(this.wrongGuesses),
      guessedLetters: Array.from(this.guessedLetters),
      remainingAttempts: this.maxWrong - this.wrongGuesses.size,
      status: this.status,
      secret: this.status === "lost" ? this.secret : null,
    };
  }
}

module.exports = HangmanGame;
