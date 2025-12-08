import { useEffect, useState, useMemo } from "react";
import Card from "./Card";


function getCardValue(card) {
  const order = {
    ace: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, jack: 11, queen: 12, king: 13,
  };
  return order[card.value.toString().toLowerCase()];
}

function canPlayCard(card, pileTopCard){
  if(!pileTopCard) return true;

  const a = getCardValue(card);
  const b = pileTopCard.numValue;

  if(Math.abs(a - b) === 1) return true;
  if((a === 1 && b === 13) || (a === 13 && b === 1)) return true;

  return false;
}


function GameBoard({ socket, playerId, playerName, onNextScreen }) {
  const [gameState, setGameState] = useState(socket.session.state);
  const [sessionId] = useState(socket.session.sessionId);
  const [draggedCard, setDraggedCard] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

    const myHand = gameState?.hands?.[playerId] || [];
    const opponentId = useMemo(() => socket.session.players.find(p => p.id !== playerId)?.id, [socket.session, playerId]);
    const opponentHandLength = gameState?.hands?.[opponentId]?.length || 0;
    const myCantPlayStatus = gameState?.cantPlay?.[playerId] || false;
    const myStackReadyStatus = gameState?.stackReady?.[playerId] || false;


    const myStockPileLength = gameState?.stockPiles?.[playerId]?.length || 0; 
    const opponentStockPileLength = gameState?.stockPiles?.[opponentId]?.length || 0; 
    
    const opponentName = socket.session.players.find(p => p.id !== playerId)?.name || 'Opponent';
    
    const centerPileLeft = gameState?.piles?.left;
    const centerPileRight = gameState?.piles?.right;

  // --- Socket Listeners ---
  useEffect(() => {
    
    // 1. Handle real-time game updates
    socket.on("gameUpdate", (data) => {
      if (!data.ok) {
        setStatusMessage(data.error);
        return;
      }
      
      setGameState(data.state);
      setStatusMessage(data.message || "");

      // Handle game over
      if (data.gameOver) {
        setStatusMessage(`Game Over! ${data.winner === playerId ? 'You Won!' : `${opponentName} Won!`}`);
        setTimeout(onNextScreen, 2000);
      }
    });
    
    // 2. Handle opponent disconnection
    socket.on("opponentDisconnected", (data) => {
        setStatusMessage(data.message);
        socket.disconnect(); 
        setTimeout(onNextScreen, 3000); 
    });
    

    return () => {
      socket.off("gameUpdate");
      socket.off("opponentDisconnected");
    };
  }, [socket, opponentName, onNextScreen]);

  useEffect(() => {
    if (myHand.length < 5 && myStockPileLength > 0){
        socket.emit("drawCard", {
          sessionId, 
          playerId
        });
      }
  }, [myHand.length, myStockPileLength, socket, sessionId, playerId])


  // --- Game Actions ---
function handleStackUp() {
    socket.emit("stackUp", { sessionId, playerId });
}
  
  function handleDrop(pileSide) {
    if (!draggedCard) return;

    const topCard = pileSide === "left" ? centerPileLeft : centerPileRight;
    
    // Check local validity first to give instant feedback
    if (!canPlayCard(draggedCard, topCard)) {
      setStatusMessage("Invalid move!");
      setDraggedCard(null);
      return;
    }

    // Emit the move to the server for validation and state update
    socket.emit("playCard", {
      sessionId,
      playerId,
      card: draggedCard,
      pileSide
    });

    setDraggedCard(null);
  }

  function handleCantPlay() {
    socket.emit("checkStalemate", { sessionId });
  }

return (
        <div className="speed-board">
            <div className="board-container">
                {/* Status Message */}
                <div className="status-bar">{statusMessage}</div>

                {/* Player 2 (Opponent) area*/}
                <div className="player-area opponent-area">
                    {/*Opponent Stock Pile */}
                    <div className="stock-pile">
                        <div className="stock-count">Stock: {opponentStockPileLength}</div>
                        {opponentStockPileLength > 0 && (
                            <Card card={{}} faceUp={false} />
                        )}
                        {opponentStockPileLength === 0 && (
                             <div className="empty-stack">Empty</div>
                        )}
                    </div>
                    <div className="label">
                        {opponentName} — Hand: {opponentHandLength}
                    </div>
                    <div className="hand-row">
                        {Array(opponentHandLength).fill().map((_, index) => (
                            <Card key={`p2card-${index}`} card={{}} faceUp={false} />
                        ))}
                    </div>
                </div>

                {/* Center area (play zone) */}
                <div className="middle-area">
                    <div className="stack-placeholder"></div>

                    {/* Left Play Pile */}
                    <div
                        className="stack"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop("left")}
                    >
                        <div className="label">Play</div>
                        {centerPileLeft && (

                            <Card 
                                card={centerPileLeft} 
                                faceUp 
                            />
                        )}
                    </div>

                    {/* Right Play Pile */}
                    <div
                        className="stack"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop("right")}
                    >
                        <div className="label">Play</div>
                        {centerPileRight && (

                            <Card 
                                card={centerPileRight} 
                                faceUp 
                            />
                        )}
                    </div>
                    <div className="stack-placeholder"></div>
                </div>

                {/* Player 1 area*/}
                <div className="player-area my-area">
                    <div className="controls">
                        <button onClick={handleCantPlay} disabled={myCantPlayStatus}>
                            {myCantPlayStatus ? "Waiting for Opponent..." : "Can't Play"}
                        </button>
                        <button onClick={handleStackUp} disabled={myStackReadyStatus}>
                          {myStackReadyStatus ? "Waiting for Opponent to Flip..." : "Flip Card"}
                      </button>
                    </div>

                    <div className="label">
                        {playerName} — Hand: {myHand.length}
                    </div>

                    {/*Player Stock Pile */}
                    <div className="stock-pile">
                        <div className="stock-count">Stock: {myStockPileLength}</div>
                        {myStockPileLength > 0 && (
                            <Card 
                                // Placeholder card for visual stack
                                card={{}} 
                                faceUp={false} 
                            />
                        )}
                        {myStockPileLength === 0 && (
                             <div className="empty-stack">Empty</div>
                        )}
                    </div>
                    
                    <div className="hand-row">
                        {myHand.map((card) => (
                            <Card
                                key={card.id}
                                card={card}
                                faceUp
                                onDragStart={() => setDraggedCard(card)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameBoard;