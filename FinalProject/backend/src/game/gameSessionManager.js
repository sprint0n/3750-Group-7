
class GameSessionManager {
  constructor() {
    this.waitingPlayer = null;      
    this.sessions = {};             
  }

  // Create a new session
  createSession(p1, p2) {
    const sessionId = `${p1.id}-${p2.id}`;
    const session = {
      id: sessionId,
      players: [p1, p2],       
      state: null,             
      createdAt: Date.now()
    };
    this.sessions[sessionId] = session;
    return session;
  }

  // Match a player with waiting player
  matchPlayer(player) {
    if (!this.waitingPlayer) {
      this.waitingPlayer = player;
      return null; // still waiting
    }

    const session = this.createSession(this.waitingPlayer, player);
    const p1 = this.waitingPlayer;
    const p2 = player;
    this.waitingPlayer = null;

    return { session, p1, p2 };
  }

  // Get session by ID
  getSession(sessionId) {
    return this.sessions[sessionId];
  }

  // Delete session
  deleteSession(sessionId) {
    delete this.sessions[sessionId];
  }
}

module.exports = new GameSessionManager();