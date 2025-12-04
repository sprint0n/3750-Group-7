import { useEffect, useState } from "react";
import { createDeck } from "../../data/cards";
import Card from "./Card";

function GameBoard({ player1Name, player2Name, onNextScreen }) {
  console.log("Player 1:", player1Name);
  console.log("Player 2:", player2Name);

  // player state
  const [p1Hand, setP1Hand] = useState([]);
  const [p2Hand, setP2Hand] = useState([]);
  const [p1DrawPile, setP1DrawPile] = useState([]);
  const [p2DrawPile, setP2DrawPile] = useState([]);

  // center and the side piles
  const [centerPileLeft, setCenterPileLeft] = useState([]);
  const [centerPileRight, setCenterPileRight] = useState([]);
  const [leftSidePile, setLeftSidePile] = useState([]);
  const [rightSidePile, setRightSidePile] = useState([]);

  // interactions with the drag and drop
  const [draggedCard, setDraggedCard] = useState(null);
  const [p1CantPlay, setP1CantPlay] = useState(false);
  const [p2CantPlay, setP2CantPlay] = useState(false);

  // initial game set up (starting hands, piles, etc)
  useEffect(() => {
    const deck = createDeck();

    setP1Hand(deck.splice(0, 5));
    setP2Hand(deck.splice(0, 5));

    setCenterPileLeft([deck.splice(0, 1)[0]]);
    setCenterPileRight([deck.splice(0, 1)[0]]);

    setLeftSidePile(deck.splice(0, 5));
    setRightSidePile(deck.splice(0, 5));

    const half = Math.floor(deck.length / 2);
    setP1DrawPile(deck.splice(0, half));
    setP2DrawPile(deck);
  }, []);

  // cant play agreement
  useEffect(() => {
    if (!p1CantPlay || !p2CantPlay) return;

    handleCantPlayResolution();

    if (leftSidePile.length === 0 && rightSidePile.length === 0) {
      resetFromCenterStalemate();
    }

    setP1CantPlay(false);
    setP2CantPlay(false);
  }, [p1CantPlay, p2CantPlay, leftSidePile.length, rightSidePile.length]);

  // helpers
  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function handleCantPlayResolution() {
    if (leftSidePile.length > 0 && rightSidePile.length > 0) {
      setCenterPileLeft((prev) => [...prev, leftSidePile[0]]);
      setCenterPileRight((prev) => [...prev, rightSidePile[0]]);

      setLeftSidePile((prev) => prev.slice(1));
      setRightSidePile((prev) => prev.slice(1));
    }
  }

  function handleDrop(whichPile) {
    if (!draggedCard) return;

    const pile = whichPile === "left" ? centerPileLeft : centerPileRight;
    const topCard = pile[pile.length - 1];

    if (!canPlayCard(draggedCard, topCard)) return;

    setP1Hand((prev) => prev.filter((c) => c.id !== draggedCard.id));

    if (whichPile === "left") {
      setCenterPileLeft((prev) => [...prev, draggedCard]);
    } else {
      setCenterPileRight((prev) => [...prev, draggedCard]);
    }

    setDraggedCard(null);
  }

  function handleDraw() {
    if (p1Hand.length >= 5) return;
    if (p1DrawPile.length === 0) return;

    setP1Hand((prev) => [...prev, p1DrawPile[0]]);
    setP1DrawPile((prev) => prev.slice(1));
  }

  function resetFromCenterStalemate() {
    const pool = [...centerPileLeft, ...centerPileRight];
    if (pool.length < 2) return;

    const shuffled = shuffle(pool);

    setLeftSidePile(shuffled.splice(0, 5));
    setCenterPileLeft([shuffled.splice(0, 1)[0]]);
    setCenterPileRight([shuffled.splice(0, 1)[0]]);
    setRightSidePile(shuffled.splice(0, 5));
  }

  function getCardValue(card) {
    const order = {
      ace: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      jack: 11,
      queen: 12,
      king: 13,
    };
    return order[card.value];
  }

  function canPlayCard(card, pileTopCard) {
    if (!pileTopCard) return true;

    const a = getCardValue(card);
    const b = getCardValue(pileTopCard);

    if (Math.abs(a - b) === 1) return true;
    if ((a === 1 && b === 13) || (a === 13 && b === 1)) return true;

    return false;
  }

  return (
    <div className="speed-board">
      <div className="board-container">
        {/* player 2 game*/}
        <div className="player-area">
          <div className="label">
            {player2Name} — Hand: {p2Hand.length}
          </div>
          <div className="label">
            {player2Name} — Draw: {p2DrawPile.length}
          </div>

          <div className="hand-row">
            {p2Hand.map((card) => (
              <Card key={card.id} card={card} faceUp={false} />
            ))}
          </div>
        </div>

        {/* center area (play zone and piles with 5) */}
        <div className="middle-area">
          <div className="stack">
            <div className="label">Side ({leftSidePile.length})</div>
            {leftSidePile.length > 0 ? (
              <Card card={leftSidePile[0]} faceUp={false} />
            ) : (
              <div className="empty-stack">Empty</div>
            )}
          </div>

          <div
            className="stack"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop("left")}
          >
            <div className="label">Play</div>
            {centerPileLeft.length > 0 && (
              <Card card={centerPileLeft[centerPileLeft.length - 1]} faceUp />
            )}
          </div>

          <div
            className="stack"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop("right")}
          >
            <div className="label">Play</div>
            {centerPileRight.length > 0 && (
              <Card card={centerPileRight[centerPileRight.length - 1]} faceUp />
            )}
          </div>

          <div className="stack">
            <div className="label">Side ({rightSidePile.length})</div>
            {rightSidePile.length > 0 ? (
              <Card card={rightSidePile[0]} faceUp={false} />
            ) : (
              <div className="empty-stack">Empty</div>
            )}
          </div>
        </div>

        {/* player 1 game*/}
        <div className="player-area">
          <div className="controls">
            <button onClick={() => setP1CantPlay(true)} disabled={p1CantPlay}>
              {p1CantPlay ? "Waiting..." : "Can't Play"}
            </button>

            <button onClick={onNextScreen}>NEXT SCREEN DUMMMMYYY</button>

            <button onClick={handleDraw} disabled={p1Hand.length >= 5}>
              Draw
            </button>

            <button onClick={() => setP2CantPlay(true)} disabled={p2CantPlay}>
              Simulate P2 Can't Play
            </button>
          </div>

          <div className="label">
            {player1Name} — Draw: {p1DrawPile.length}
          </div>

          {p1DrawPile.length > 0 && (
            <Card card={p1DrawPile[0]} faceUp={false} />
          )}

          <div className="hand-row">
            {p1Hand.map((card) => (
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
