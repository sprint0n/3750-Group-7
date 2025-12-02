
class gameSession {
  constructor() {
    this.waitingPlayer = null;
    this.sessions = {}; 
  }

  createSession(player1, player2) {
    const sessionId = `${player1.id}-${player2.id}`;

    this.sessions[sessionId] = {
      id: sessionId,
      players: [player1.id, player2.id],
      createdAt: Date.now()
    };

    return this.sessions[sessionId];
  }

  matchPlayer(socket) {
    if (!this.waitingPlayer) {
      this.waitingPlayer = socket;
      return null;
    }

    const session = this.createSession(this.waitingPlayer, socket);

    const p1 = this.waitingPlayer;
    const p2 = socket;

    this.waitingPlayer = null;

    return { session, p1, p2 };
  }

  getSession(sessionId) {
    return this.sessions[sessionId] || null;
  }

  deleteSession(sessionId) {
    delete this.sessions[sessionId];
  }
}

module.exports = new gameSession();