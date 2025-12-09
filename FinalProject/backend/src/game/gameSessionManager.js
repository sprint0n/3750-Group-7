class GameSessionManager {
  constructor() {
    console.log("Waiting Player State is Reset");
    this.waitingPlayer = null;
    this.sessions = {};
  }

  // Create a new session
  createSession(p1, p2) {
    const p1Data = { id: p1.id, name: p1.name, socketId: p1.socketId };
    const p2Data = { id: p2.id, name: p2.name, socketId: p2.socketId }; 
    
    const sessionId = `${p1Data.id}-${p2Data.id}`;
    const session = {
      id: sessionId,
      players: [p1Data, p2Data], 
      state: null,
      createdAt: Date.now()
    };
    this.sessions[sessionId] = session;
    return session;
  }

  matchPlayer(player, currentSocket) {
    if (!this.waitingPlayer) {
      // Set the initial waiting player, storing both ID and the socket object
      this.waitingPlayer = { 
        ...player, 
        socket: currentSocket, 
        socketId: currentSocket.id 
      }; 
      console.log(`[MATCH] Player ${player.name} (${currentSocket.id}) is now WAITING.`); 
      return null; 
    }
    

    if (this.waitingPlayer.id === player.id) {

      console.log(`[MATCH] Player ${player.name} (${player.id}) is already waiting. Updating socket reference.`);
      

      this.waitingPlayer.socket = currentSocket;
      this.waitingPlayer.socketId = currentSocket.id;
      
      return null; 
    }

    console.log("Match has been found!");
  
    console.log(`Match between ${this.waitingPlayer.name} and ${player.name}`); 

    const p1 = this.waitingPlayer;
    const p2Data = player; 
    
    const session = this.createSession(p1, p2Data);
    
    this.waitingPlayer = null;

    return { 
      session, 
      p1Socket: p1.socket, 
      p2Socket: currentSocket 
    };
  }

  // Get session by ID
  getSession(sessionId) {
    return this.sessions[sessionId];
  }

  // Delete session
  deleteSession(sessionId) {
    delete this.sessions[sessionId];
  }

  findSessionBySocketId(socketId) {
    const sessionKeys = Object.keys(this.sessions);
    for (const key of sessionKeys) {
        const session = this.sessions[key];
        if (session.players.some(p => p.socketId === socketId)) {
            return session;
        }
    }
    return null;
  }

  removeFromWaitingList(socketId) {
      if (this.waitingPlayer && this.waitingPlayer.socketId === socketId) {
          this.waitingPlayer = null;
          return true;
      }
      return false;
  }
}


module.exports = new GameSessionManager();