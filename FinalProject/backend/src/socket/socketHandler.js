/*const GameManager = require("../game/GameManager");
const {getAllResults, saveResult} = require("../db/resultsRepo");
const { getRandomWord } = require("../db/wordsRepo");

let waitingPlayer = null; 

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);


    socket.on("submitName", ({ playerName }) => {
      socket.data.playerName = playerName;

      if (!waitingPlayer) {
        waitingPlayer = socket;
        socket.emit("waitingForPlayer");
        return;
      }


      const player1 = waitingPlayer.data.playerName;
      const player2 = socket.data.playerName;

      const { id: gameId, session } = GameManager.createGame(player1, player2);


      waitingPlayer.join(gameId);
      socket.join(gameId);


      waitingPlayer.data.gameId = gameId;
      socket.data.gameId = gameId;

  
      io.to(gameId).emit("roundSetup", {
         gameId,
         round: session.round,
         setter: session.currentSetter,
         guesser: session.currentGuesser,
         sessionState: session.getState(),
      });

      waitingPlayer = null; 
    });

    socket.on("requestRandomWord", async () => {
  const word = await getRandomWord();

  if (!word) {
    socket.emit("randomWord", {
      phrase: null,
      error: "No words available",
    });
    return;
  }

  socket.emit("randomWord", {
    phrase: word.phrase.toUpperCase(),
    category: word.category || null,
  });
});


    socket.on("setPhrase", ({ gameId, phrase, source }) => {
      const session = GameManager.getGame(gameId);
      if (!session) return;

      session.startRound(phrase, source);

      io.to(gameId).emit("roundStarted", {
        round: session.round,
        setter: session.currentSetter,
        guesser: session.currentGuesser,
        sessionState: session.getState(),
      });
    });


socket.on("makeGuess", async ({ gameId, letter }) => {
  const session = GameManager.getGame(gameId);
  if (!session) return;


  const guesser = session.currentGuesser;
  const playerName = socket.data.playerName;

  if (playerName !== guesser) {
    socket.emit("notAllowedToGuess"); 
    return;
  }


  session.makeGuess(letter);

  io.to(gameId).emit("gameUpdate", {
    round: session.round,
    sessionState: session.getState(),
  });


 if (session.isGameOver()) {
  io.to(gameId).emit("gameOver", { results: session.results });


  for (const r of session.results) {

    await saveResult(r);
  }


  const allResults = await getAllResults();
  io.emit("highScoresUpdated", { scores: allResults });


  GameManager.deleteGame(gameId)

  } else if (!session.currentGame) {

    io.to(gameId).emit("roundSetup", {
      gameId,
      round: session.round,
      setter: session.currentSetter,
      guesser: session.currentGuesser,
      sessionState: session.getState(),
    });
  }
});


    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);


      if (waitingPlayer === socket) waitingPlayer = null;

      const gameId = socket.data.gameId;
      if (gameId) {
        const session = GameManager.getGame(gameId);
        if (session) {
          io.to(gameId).emit("playerDisconnected", {
            player: socket.data.playerName,
          });
          GameManager.deleteGame(gameId);
        }
      }
    });
  });
};*/