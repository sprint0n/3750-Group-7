const { saveResult } = require("../db/resultsRepo");

const valueMap = {
  1: "ace", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "jack", 12: "queen", 13: "king",
};
const suitMap = {
  "H": "hearts", "D": "diamonds", "C": "clubs", "S": "spades",
};


function createDeck() {
  const nums = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  const suits = ["H","D","C","S"];
  const deck = [];

 nums.forEach(n => suits.forEach(s => {
    const valueStr = valueMap[n];
    const suitStr = suitMap[s];

    deck.push({
      numValue: n,
      value: valueStr,
      suit: suitStr,
      id: `${valueStr}_of_${suitStr}`,
      image: `/cards/${valueStr}_of_${suitStr}.png`,
    });
  }));

  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Helper function to check if a player can make *any* valid move
function canPlay(hand, piles) {
  const leftPileValue = piles.left.numValue;
  const rightPileValue = piles.right.numValue;

  for (const card of hand) {
    const cardValue = card.numValue;

    // Check against left pile
    let validLeft =
      Math.abs(cardValue - leftPileValue) === 1 ||
      (cardValue === 1 && leftPileValue === 13) ||
      (cardValue === 13 && leftPileValue === 1);

    if (validLeft) return true;

    // Check against right pile
    let validRight =
      Math.abs(cardValue - rightPileValue) === 1 ||
      (cardValue === 1 && rightPileValue === 13) ||
      (cardValue === 13 && rightPileValue === 1);

    if (validRight) return true;
  }
  return false;
}

// Resets the play piles state in case of a stalemate
function resetPiles(session) {
  // Gather all cards from the two current play piles
  const cardsToReshuffle = [session.state.piles.left, session.state.piles.right];

  // Reshuffle them
  shuffle(cardsToReshuffle);

  // Set the new play piles
  session.state.piles.left = cardsToReshuffle.pop();
  session.state.piles.right = cardsToReshuffle.pop();


  return session.state;
}

// New function to handle the stalemate logic
function handleStalemate(sessionId) {
  const sessionManager = require("./gameSessionManager");
  const session = sessionManager.getSession(sessionId);
  if (!session) return { error: "Session not found", ok: false };

  const p1Id = session.players[0].id;
  const p2Id = session.players[1].id;
  const p1Hand = session.state.hands[p1Id];
  const p2Hand = session.state.hands[p2Id];
  const piles = session.state.piles;

  // Check if neither player has a valid move against the current play piles
  const p1CanPlay = canPlay(p1Hand, piles);
  const p2CanPlay = canPlay(p2Hand, piles);

  if (!p1CanPlay && !p2CanPlay) {
    // This is the condition for reshuffling the play piles
    const newState = resetPiles(session);

    return {
      ok: true,
      stalemate: true,
      message: "Stalemate reached! Play piles have been reshuffled.",
      state: newState
    };
  }

  // Not a stalemate (a move is still available)
  return {
    ok: true,
    stalemate: false,
    message: "A move is still available.",
    state: session.state
  };
}


module.exports = {
  // Initialize game state
  startGame(session) {
    let deck = shuffle(createDeck());

    // 20 cards each player
    const p1Hand = deck.splice(0, 5);
    const p2Hand = deck.splice(0, 5);

    const p1Stock = deck.splice(0,20);
    const p2Stock = deck.splice(0,20);

    // Two play piles
    const piles = {
      left: deck.pop(),
      right: deck.pop()
    };

    // Use player IDs as keys, NOT objects
    session.state = {
      hands: {
        [session.players[0].id]: p1Hand,
        [session.players[1].id]: p2Hand
      },
      stockPiles: { 
        [session.players[0].id]: p1Stock, 
        [session.players[1].id]: p2Stock 
      },
      piles
    };

    return session.state;
  },

  // Handle a player move
 handleMove({ sessionId, playerId, card, pileSide }) {
    const sessionManager = require("./gameSessionManager");
    const session = sessionManager.getSession(sessionId);
    if (!session) return { error: "Session not found", ok: false };

    const hand = session.state.hands[playerId];
    if (!hand) return { error: "Player hand not found", ok: false };

    const pile = session.state.piles[pileSide];
    if (!pile) return { error: "Pile not found", ok: false };

    const incomingCardNumValue = card.value; 
    const incomingCardSuitInitial = card.suit;
    
    const index = hand.findIndex(c => {
        return c.numValue === incomingCardNumValue;
    });

    if (index === -1) return { error: "Card not found in hand", ok: false };

    const cardToPlay = hand[index];

    const valid =
        Math.abs(cardToPlay.numValue - pile.numValue) === 1 || 
        (cardToPlay.numValue === 1 && pile.numValue === 13) ||
        (cardToPlay.numValue === 13 && pile.numValue === 1);

    if (!valid) return { error: "Invalid move", ok: false };

    session.state.piles[pileSide] = cardToPlay; 

    hand.splice(index, 1);

    // Check for game over
    const finished = hand.length === 0;
    if (finished) {
      const otherPlayerId = session.players.find(p => p.id !== playerId).id;

      saveResult({
        playerName: playerId,
        won: true,
        loserCards: session.state.hands[otherPlayerId].length
      });

      return {
        ok: true,
        gameOver: true,
        winner: playerId,
        state: session.state
      };
    }

    return {
      ok: true,
      gameOver: false,
      state: session.state
    };
  },
  handleDrawCard({ sessionId, playerId }) {
    const sessionManager = require("./gameSessionManager");
    const session = sessionManager.getSession(sessionId);
    if (!session) return { error: "Session not found", ok: false };

    const stock = session.state.stockPiles[playerId];
    const hand = session.state.hands[playerId];

    if (hand.length >= 5) return { error: "Hand is full (max 5 cards)", ok: false };
    if (stock.length === 0) return { error: "Draw pile is empty", ok: false };

    const card = stock.pop(); // Take card from the stock pile
    hand.push(card); // Add it to the hand

    return {
      ok: true,
      state: session.state,
      message: `${session.players.find(p => p.id === playerId).name} drew a card.`
    };
  },

  handleStalemate
};