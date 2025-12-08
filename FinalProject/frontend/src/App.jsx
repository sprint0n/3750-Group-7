import { useState, useEffect } from "react";
import io from "socket.io-client";

import NameForm from "./components/game/NameForm";
import WaitingScreen from "./components/game/WaitingScreen";
import CountdownScreen from "./components/game/CountdownScreen";
import GameBoard from "./components/game/GameBoard";
import ResultsScreen from "./components/game/ResultsScreen";

const socket = io("http://localhost:4000");

function App() {
  const [screen, setScreen] = useState("name");
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState(null);
  const [winnerName, setWinnerName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);

  useEffect(() => {
    if(!playerId){
      setPlayerId(socket.id);
    }
  }, [playerId]);

  useEffect(() => {
    if (nameSubmitted && playerId) {
        setScreen("waiting");
    }
  }, [nameSubmitted, playerId]);

  return (
    <>
      {screen === "name" && (
        <NameForm
          onSubmit={(name) => {
            setPlayerName(name);
            setNameSubmitted(true);
          }}
        />
      )}

      {screen === "waiting" && (
        <WaitingScreen
          socket={socket}
          playerId={playerId}
          playerName={playerName}
          onGameStart={() => setScreen("countdown")}
        />
      )}

      {screen === "countdown" && (
        <CountdownScreen onFinish={() => setScreen("game")} />
      )}

      {screen === "game" && (
        <GameBoard
          socket={socket}
          playerId={playerId}
          playerName={playerName}
          onNextScreen={(gameResult) => {
            setWinnerName(gameResult.winnerName);
            setScreen("results");
          }}
        />
      )}


      {screen === "results" && (
        <ResultsScreen
          playerId={playerId}
          playerName={playerName}
          winnerName={winnerName}
        />
      )}
    </>
  );
};

export default App;
