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
      const match = sessionManager.matchPlayer(player, socket); 

  
      if (!match) {
        socket.emit("waiting", "Waiting for another player...");
        return;
      }


      const { session, p1Socket, p2Socket } = match;


      p1Socket.join(session.id);
      p2Socket.join(session.id);

      console.log(`Match between ${p1Socket} and ${p2Socket}`);

      // Initialize game
      const initialState = gameLogic.startGame(session);

      io.to(session.id).emit("gameStart", {
        sessionId: session.id,
        players: session.players,
        state: initialState
      });
    });


    socket.on("checkStalemate", (data) => {
      const result = gameLogic.handleStalemate({
          sessionId: data.sessionId,
          playerId: data.playerId || socket.data.id  
      }); 

      if (result.ok) {
        io.to(data.sessionId).emit("gameUpdate", {
          ok: true,
          stalemate: result.stalemate,
          message: result.message,
          state: result.state
        });
      } else {
        socket.emit("error", { message: result.error });
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
        io.to(data.sessionId).emit("gameUpdate", {
          ok: true,
          message: result.message,
          state: result.state
        });
      } else {
        socket.emit("error", { message: result.error });
      }
    });

    socket.on("stackUp", (data) => {
      const result = gameLogic.handleStackUp({ 
        sessionId: data.sessionId, 
        playerId: data.playerId || socket.data.id
      });

      if (result.ok) {
        io.to(data.sessionId).emit("gameUpdate", {
          ok: true,
          flipped: result.flipped,
          message: result.message,
          state: result.state
        });
      } else {
        socket.emit("error", { message: result.error });
      }
    });



    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);

      const session = sessionManager.findSessionBySocketId(socket.id); 
      
      if (session) {
        const opponentId = session.players.find(p => p.socketId !== socket.id)?.id;
        

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