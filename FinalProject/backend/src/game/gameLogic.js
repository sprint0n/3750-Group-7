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
function resetPiles(session) {
    const p1Id = session.players[0].id;
    const p2Id = session.players[1].id;
    
    let cardsToReshuffle = [];
    
    // 1. Collect all cards: hands, stock piles (cleared by splice(0)), and center piles
    cardsToReshuffle.push(...session.state.hands[p1Id].splice(0));
    cardsToReshuffle.push(...session.state.hands[p2Id].splice(0));
    cardsToReshuffle.push(...session.state.stockPiles[p1Id].splice(0));
    cardsToReshuffle.push(...session.state.stockPiles[p2Id].splice(0));
    cardsToReshuffle.push(session.state.piles.left);
    cardsToReshuffle.push(session.state.piles.right);

    // Clear piles to ensure a clean state update (fix for the rendering bug)
    session.state.piles.left = null;
    session.state.piles.right = null;
    
    // 2. Shuffle the complete deck (52 cards)
    let newDeck = shuffle(cardsToReshuffle); 

    // 3. SAFETY FIX: Take the two center cards off the deck first, guaranteeing they exist.
    const pileRightCard = newDeck.pop();
    const pileLeftCard = newDeck.pop();
    
    // The deck now has exactly 50 cards remaining.

    // 4. Deal player hands (5 cards each)
    session.state.hands[p1Id].push(...newDeck.splice(0, 5));
    session.state.hands[p2Id].push(...newDeck.splice(0, 5));
    
    // The deck now has exactly 40 cards remaining.
    
    // 5. Deal stock piles (20 cards each) - ensures exactly 20 cards are assigned.
    session.state.stockPiles[p1Id].push(...newDeck.splice(0, 20));
    session.state.stockPiles[p2Id].push(...newDeck.splice(0, 20));

    // 6. Assign the center pile cards
    session.state.piles.left = pileLeftCard;
    session.state.piles.right = pileRightCard;

    return session.state;
}
function handleStalemate({ sessionId, playerId }) {
    const sessionManager = require("./gameSessionManager");
    const session = sessionManager.getSession(sessionId);
    if (!session) return { error: "Session not found", ok: false };

    const state = session.state;
    const p1Id = session.players[0].id;
    const p2Id = session.players[1].id;
    const currentHand = state.hands[playerId];
    const piles = state.piles;

    if (canPlay(currentHand, piles)) {
        return { 
            ok: false, 
            error: "You still have a valid move and cannot signal 'Can't Play'.", 
            state: state
        };
    }
    
    state.cantPlay[playerId] = true;

    const p1IsStuck = state.cantPlay[p1Id];
    const p2IsStuck = state.cantPlay[p2Id];

    if (p1IsStuck && p2IsStuck) {
        const newState = resetPiles(session);
        
        newState.cantPlay[p1Id] = false;
        newState.cantPlay[p2Id] = false;

        return {
            ok: true,
            stalemate: true,
            message: "Stalemate reached! Play piles have been reshuffled.",
            state: newState
        };
    }

    return {
        ok: true,
        stalemate: false,
        message: "Waiting for opponent to signal 'Can't Play'.",
        state: state
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
      piles,
      cantPlay: {
        [session.players[0].id]: false, 
        [session.players[1].id]: false 
      },
      stackReady: {
        [session.players[0].id]: false, 
        [session.players[1].id]: false 
      }
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

    const incomingCardNumValue = card.numValue; 
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


    const opponent = session.players.find(p => p.id !== playerId);
    const opponentId = opponent.id;
    const opponentName = opponent.name;
    const opponentHand = session.state.hands[opponentId];
    let message = `${session.players.find(p => p.id === playerId).name} played a card.`;

    if (session.state.cantPlay[opponentId] === true) {
        
        if (canPlay(opponentHand, session.state.piles)) {
            
            session.state.cantPlay[opponentId] = false;
            
            message = `${session.players.find(p => p.id === playerId).name} played a card. ${opponentName}'s 'Can't Play' status was reset.`;
        }
    }

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

  handleStackUp({ sessionId, playerId }) {
    const sessionManager = require("./gameSessionManager");
    const session = sessionManager.getSession(sessionId);
    if (!session) return { error: "Session not found", ok: false };

    const state = session.state;
    const p1Id = session.players[0].id;
    const p2Id = session.players[1].id;
    const p1Stock = state.stockPiles[p1Id];
    const p2Stock = state.stockPiles[p2Id];

    if (p1Stock.length === 0 || p2Stock.length === 0) {
        return { 
            ok: false, 
            error: "Cannot flip cards. At least one stock pile is empty.", 
            state: state
        };
    }
    
    state.stackReady[playerId] = true;

    const p1IsReady = state.stackReady[p1Id];
    const p2IsReady = state.stackReady[p2Id];

    if (p1IsReady && p2IsReady) {

        state.piles.left = p1Stock.pop();
        
        state.piles.right = p2Stock.pop();
        
        state.stackReady[p1Id] = false;
        state.stackReady[p2Id] = false;
        
        state.cantPlay[p1Id] = false;
        state.cantPlay[p2Id] = false;

        return {
            ok: true,
            flipped: true,
            message: "Stack flipped! New cards are now in play.",
            state: state
        };
    }

    return {
        ok: true,
        flipped: false,
        message: "Waiting for opponent to press 'Flip Card'.",
        state: state
    };
},
  handleDrawCard({ sessionId, playerId }) {
    const sessionManager = require("./gameSessionManager");
    const session = sessionManager.getSession(sessionId);
    if (!session) return { error: "Session not found", ok: false };

    const stock = session.state.stockPiles[playerId];
    const hand = session.state.hands[playerId];

    // Calculate how many cards are needed to reach the max hand size (5)
    const cardsToDraw = 5 - hand.length;

    let cardsDrawn = 0;
    // Draw cards one by one until the hand is full OR the stock is empty
    for (let i = 0; i < cardsToDraw && stock.length > 0; i++) {
        const card = stock.pop(); 
        hand.push(card);
        cardsDrawn++;
    }

    if (cardsDrawn === 0 && hand.length < 5) {
        return { error: "Draw pile is empty, hand not full.", ok: false };
    }

    return {
      ok: true,
      state: session.state,
      message: `${session.players.find(p => p.id === playerId).name} drew ${cardsDrawn} card(s).`
    };
  },

  handleStalemate
};