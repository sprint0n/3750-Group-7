// src/game/GameSession.js

const HangmanGame = require("./HangmanGame");

class GameSession {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;

    this.round = 1;
    this.currentSetter = player1;
    this.currentGuesser = player2;

    this.currentGame = null;

    this.results = [];
  }

  startRound(phrase, source = "typed") {
    this.currentGame = new HangmanGame(phrase);
    this.currentSource = source;
  }

  makeGuess(letter) {
    if (!this.currentGame) return;

    this.currentGame.guess(letter);

    if (
      this.currentGame.status === "won" ||
      this.currentGame.status === "lost"
    ) {
      this._finishRound();
    }
  }

  _finishRound() {
    const state = this.currentGame.getState();

    this.results.push({
      playerName: this.currentGuesser,
      phrase: this.currentGame.secret,
      numGuesses: state.guessedLetters.length + state.wrongGuesses.length,
      success: state.status === "won",
      source: this.currentSource,
    });

    if (this.round === 1) {
      this.round = 2;
      this.currentSetter = this.player2;
      this.currentGuesser = this.player1;
      this.currentGame = null;
    } else {
      this.round = 3;
    }
  }

  isGameOver() {
    return this.round === 3;
  }

  getState() {
    if (!this.currentGame) {
      return {
        round: this.round,
        waitingForPhrase: true,
      };
    }

    return {
      round: this.round,
      waitingForPhrase: false,
      state: this.currentGame.getState(),
      setter: this.currentSetter,
      guesser: this.currentGuesser,
    };
  }
}

module.exports = GameSession;
