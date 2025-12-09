import { useState } from "react";

import NameForm from "./components/game/NameForm";
import WaitingScreen from "./components/game/WaitingScreen";
import CountdownScreen from "./components/game/CountdownScreen";
import GameBoard from "./components/game/GameBoard";
import NameScreen from "./components/game/NameScreen";
import ResultsScreen from "./components/game/ResultsScreen";

function App() {
  const [screen, setScreen] = useState("name");
  const [playerName, setPlayerName] = useState("");

  return (
    <>
      {screen === "name" && (
        <NameForm
          onSubmit={(name) => {
            setPlayerName(name);
            setScreen("waiting");
          }}
        />
      )}

      {screen === "waiting" && (
        <WaitingScreen
          playerName={playerName}
          onNext={() => setScreen("countdown")}
        />
      )}

      {screen === "countdown" && (
        <CountdownScreen onFinish={() => setScreen("game")} />
      )}

      {screen === "game" && (
        <GameBoard
          player1Name={playerName}
          player2Name="Opponent"
          onNextScreen={() => setScreen("nameScreen")}
        />
      )}

      {screen === "nameScreen" && (
        <NameScreen
          onSubmit={(name) => {
            setPlayerName(name);
            setScreen("results");
          }}
        />
      )}

      {screen === "results" && <ResultsScreen playerName={playerName} />}
    </>
  );
}

export default App;
