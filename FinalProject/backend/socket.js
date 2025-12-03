const sessionManager = require("./src/game/gameSessionManager");
const gameLogic = require("./src/game/gameLogic");

module.exports = (server) => {
  const io = require("socket.io")(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    const match = sessionManager.matchPlayer(socket);

    // If match NOT found → first player waits
    if (!match) {
      socket.emit("waiting", "Waiting for another player...");
      return;
    }

    // Both players found
    const { session, p1, p2 } = match;

    p1.join(session.id);
    p2.join(session.id);

    // Initialize game
    const initialState = gameLogic.startGame(session);

    io.to(session.id).emit("gameStart", {
      sessionId: session.id,
      state: initialState
    });

    // Handle moves
    socket.on("playCard", (data) => {
      const result = gameLogic.handleMove(data);

      io.to(data.sessionId).emit("gameUpdate", result);

      if (result.gameOver) {
        sessionManager.deleteSession(data.sessionId);
      }
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
    });
  });
};