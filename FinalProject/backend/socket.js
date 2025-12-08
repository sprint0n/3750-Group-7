const sessionManager = require("./src/game/gameSessionManager");
const gameLogic = require("./src/game/gameLogic");

module.exports = (server) => {
  const io = require("socket.io")(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("joinGame", ({ playerId, playerName }) => {
      socket.data.id = playerId;
      socket.data.name = playerName;

      const player = { id: playerId, name: playerName, socketId: socket.id };
      const match = sessionManager.matchPlayer(player); 

  
      if (!match) {
        socket.emit("waiting", "Waiting for another player...");
        return;
      }


      const { session, p1, p2 } = match;
      
      const p1Socket = io.sockets.sockets.get(p1.socketId);
      const p2Socket = io.sockets.sockets.get(p2.socketId);

      if(!p1Socket || !p2Socket){
        console.error("Matched socket not found!");
        return;
      }

      p1Socket.join(session.id);
      p2Socket.join(session.id);

      // Initialize game
      const initialState = gameLogic.startGame(session);

      io.to(session.id).emit("gameStart", {
        sessionId: session.id,
        players: session.players,
        state: initialState
      });
    });


   socket.on("checkStalemate", (data) => {
      const result = gameLogic.handleStalemate(data.sessionId);

      if (result.stalemate) {
        io.to(data.sessionId).emit("gameUpdate", {
          ok: true,
          stalemate: true,
          message: "Piles reshuffled due to stalemate.",
          state: result.state
        });
      } else {
        io.to(data.sessionId).emit("gameUpdate", { 
            ok: false, 
            message: "Not a stalemate. A move is still available." 
        });
      }
    });

    socket.on("playCard", (data) => {
      const result = gameLogic.handleMove(data);

      io.to(data.sessionId).emit("gameUpdate", result);

      if (result.gameOver) {
        sessionManager.deleteSession(data.sessionId);
      }
    });

    socket.on("drawCard", (data) => {
      const result = gameLogic.handleDrawCard(data);

      if (result.ok) {
        io.to(data.sessionId).emit("gameUpdate", result);
      } else {
        socket.emit("error", { message: result.error }); 
      }
    });


    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);

      // We now rely on the new functions added to GameSessionManager
      const session = sessionManager.findSessionBySocketId(socket.id); 
      
      if (session) {
        const opponent = session.players.find(p => p.socketId !== socket.id);
        
        io.to(session.id).emit("opponentDisconnected", { 
          message: `${socket.data.name || 'An opponent'} disconnected. Game ended.`,
          opponentId: socket.data.id 
        });
        
        sessionManager.deleteSession(session.id);
      } else {
         sessionManager.removeFromWaitingList(socket.id);
      }
    });
  });
};