import { useEffect, useState, useRef } from "react"; // 1. Import useRef

function WaitingScreen({ socket, playerId, playerName, onGameStart }) {
  const [message, setMessage] = useState("Connecting...");
  const isMounted = useRef(false); // 2. Create the mutable reference flag


  useEffect(() => {
    // 3. Check the flag before executing the one-time logic
    if (isMounted.current) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }
  
    // Send the one-time join request
    socket.emit("joinGame", { playerId, playerName }); 
    setMessage("Waiting for another player...");

    // 4. Set the flag to true after execution
    isMounted.current = true;
  
  // We use an empty array here because the logic inside is now guarded by `isMounted`
  }, [playerId, playerName, socket]); // Note: You can now safely remove these dependencies if you wish, 
                                     // or leave them to satisfy the linter, as `isMounted` controls the execution.


  useEffect(() => {
    // ... Event listeners remain here ...
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
  }, [socket, onGameStart]); 

  return (
    <div className="screen">
      <h2>Welcome, {playerName}!</h2>
      <p>Waiting for the other player...</p>
      <p>{message}</p>
    </div>
  );
}

export default WaitingScreen;