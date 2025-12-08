import {useEffect, useState} from "react";

function WaitingScreen({ socket, playerId, playerName, onGameStart }) {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  
    socket.emit("joinGame", { playerId, playerName });
    setMessage("Waiting for another player...");
    
    socket.on("gameStart", (data) => {
      console.log("Match found! Game starting...", data);
      socket.session = data; 
      onGameStart();
    });

    socket.on("waiting", (msg) => {
      setMessage(msg);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      setMessage(`Error: ${err.message}`);
    });

    return () => {
      socket.off("gameStart");
      socket.off("waiting");
      socket.off("error");
    };
  }, [socket, playerId, playerName, onGameStart]);

  return (
    <div className="screen">
      <h2>Welcome, {playerName}!</h2>
      <p>Waiting for the other player...</p>
      <p>{message}</p>
    </div>
  );
}

export default WaitingScreen;
