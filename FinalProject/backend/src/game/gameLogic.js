const { saveResult } = require("../db/resultsRepo");
const sessionManager = require("./gameSessionManager");

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
    let leftPileValue = null;
    let rightPileValue = null;

    if(piles.left) {
      leftPileValue = piles.left.numValue;
    }
    if(piles.right){
      rightPileValue = piles.right.numValue;
    }

    for (const card of hand) { 
      const cardValue = card.numValue;

      if (leftPileValue !== null) { 
        let validLeft =
          Math.abs(cardValue - leftPileValue) === 1 ||
          (cardValue === 1 && leftPileValue === 13) ||
          (cardValue === 13 && leftPileValue === 1);

        if (validLeft) return true;
      }
      
      // --- Check against right pile ---
      if (rightPileValue !== null) {
        let validRight =
          Math.abs(cardValue - rightPileValue) === 1 ||
          (cardValue === 1 && rightPileValue === 13) ||
          (cardValue === 13 && rightPileValue === 1);

        if (validRight) return true;
      }
    }
    return false;
}
  

function handleStalemate({ sessionId, playerId }) {
    const session = sessionManager.getSession(sessionId);
    if (!session) return { error: "Session not found", ok: false };

    const state = session.state;
    const p1Id = session.players[0].id;
    const p2Id = session.players[1].id;
    const opponentId = playerId === p1Id ? p2Id : p1Id;
    const currentHand = state.hands[playerId];

    if (canPlay(currentHand, state.piles)) {
        console.log(`${playerId} Tried to signal invalid reset`);
        return { ok: false, error: "You still have a valid move.", state: {...state} };
    } 
    
    state.cantPlay[playerId] = true; 
    
    if (state.cantPlay[opponentId]) {

        let allCardsToReshuffle = [];
        
        if (state.piles.left) {
            allCardsToReshuffle.push(state.piles.left);
        }
        if (state.piles.right) {
            allCardsToReshuffle.push(state.piles.right);
        }
        
        allCardsToReshuffle = allCardsToReshuffle.concat(state.stockPiles[p1Id].splice(0));
        allCardsToReshuffle = allCardsToReshuffle.concat(state.stockPiles[p2Id].splice(0));

        state.piles.left = null; 
        state.piles.right = null;
        
        shuffle(allCardsToReshuffle);

        let targetStockPile = state.stockPiles[p1Id];
        while (allCardsToReshuffle.length > 0) {
            targetStockPile.push(allCardsToReshuffle.pop());
            targetStockPile = targetStockPile === state.stockPiles[p1Id] 
                ? state.stockPiles[p2Id] 
                : state.stockPiles[p1Id];
        }

        state.piles.left = state.stockPiles[p1Id].pop() || null; 
        state.piles.right = state.stockPiles[p2Id].pop() || null;

        state.cantPlay[p1Id] = false;
        state.cantPlay[p2Id] = false;

        return {
            ok: true,
            stalemate: true, 
            message: "STALEMATE RESOLVED! All available cards reshuffled into stocks and new cards are in play.",
            state: {
                ...state,
                piles: {
                    left: state.piles.left,
                    right: state.piles.right,
                }
            }
        };
    } else {

        const opponentName = session.players.find(p => p.id === opponentId)?.name || 'Opponent';
        
        return {
            ok: true,
            stalemate: false,
            message: `Waiting for ${opponentName} to signal 'Can't Play'.`,
            state: {...state}
        };
    }
}
async function handleMove({ sessionId, playerId, card, pileSide }) {
    const session = sessionManager.getSession(sessionId);
    if (!session) return { error: "Session not found", ok: false };

    const hand = session.state.hands[playerId];
    if (!hand) return { error: "Player hand not found", ok: false };


    const index = hand.findIndex(c => c.numValue === card.numValue);
    session.state.piles[pileSide] = hand[index]; 
    hand.splice(index, 1);
    
    const finished = hand.length === 0 && session.state.stockPiles[playerId].length === 0;

    const newStateForClient = {
      ...session.state,
      piles: {
        ...session.state.piles
      }
    };
    if (finished) {
      const winner = session.players.find(p => p.id === playerId);
      const loser = session.players.find(p => p.id !== playerId);
      
      // Calculate loser's total remaining cards (hand + stock)
      const loserCards = session.state.hands[loser.id].length + session.state.stockPiles[loser.id].length;
      
      // Save WINNER's result
      await saveResult({ 
        playerName: winner.name,
        won: true,
        loserCards: 0,
      });

      // Save LOSER's result
      await saveResult({ 
        playerName: loser.name,
        won: false,
        loserCards: loserCards,
      });

      return {
        ok: true,
        gameOver: true,
        winner: winner.id,
        winnerName: winner.name, // Pass winnerName for client-side display
        state: newStateForClient
      };
    }

    return {
      ok: true,
      gameOver: false,
      state: newStateForClient
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
      leftPile: [],
      rightPile: [],
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

  handleStackUp({ sessionId, playerId }) {
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
            state: {...state}
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
            state: {
                ...state,
                piles: {
                    left: state.piles.left,
                    right: state.piles.right
                }
            }
        };
    }

    return {
        ok: true,
        flipped: false,
        message: "Waiting for opponent to press 'Flip Card'.",
        state: { ...state}
    };
},
  handleDrawCard({ sessionId, playerId }) {
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
      state: {...session.state},
      message: `${session.players.find(p => p.id === playerId).name} drew ${cardsDrawn} card(s).`
    };
  },

  handleStalemate,
  handleMove
};