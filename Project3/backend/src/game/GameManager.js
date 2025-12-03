const GameSession = require("./GameSession");
const { randomUUID } = require("crypto");

class GameManager {
  constructor() {
    this.games = new Map();
  }

  createGame(player1, player2) {
    const id = randomUUID();
    const session = new GameSession(player1, player2);
    this.games.set(id, session);
    return { id, session };
  }

  getGame(id) {
    return this.games.get(id);
  }

  deleteGame(id) {
    this.games.delete(id);
  }
}

module.exports = new GameManager();
