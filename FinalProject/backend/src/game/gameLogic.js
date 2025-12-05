const { saveResult } = require("../db/resultsRepo");

function createDeck() {
  const nums = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  const suits = ["H","D","C","S"];
  const deck = [];

  nums.forEach(n => suits.forEach(s => deck.push({ value: n, suit: s })));

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
  const leftPileValue = piles.left.value;
  const rightPileValue = piles.right.value;

  for (const card of hand) {
    const cardValue = card.value;

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
    const p1Hand = deck.splice(0, 20);
    const p2Hand = deck.splice(0, 20);

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

    // Find the card in player's hand
    const index = hand.findIndex(
      c => c.value === card.value && c.suit === card.suit
    );
    if (index === -1) return { error: "Card not found", ok: false };

    // Check if move is valid (Classic Speed rules)
    const valid =
      Math.abs(card.value - pile.value) === 1 ||
      (card.value === 1 && pile.value === 13) ||
      (card.value === 13 && pile.value === 1);

    if (!valid) return { error: "Invalid move", ok: false };

    // Update pile
    session.state.piles[pileSide] = card;

    // Remove card from player's hand
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

  handleStalemate
};