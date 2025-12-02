//This will be where all the game logic will go

//This creates the deck of cards
function createDeck(){
    const cardNum = [1,2,3,4,5,6,7,8,9,10,"J","Q","K","A"];
    const cardSuit = ["H","D","C","S"];
    const deck = [];

    for (const num of cardNum){
        for (const suit of cardSuit){
            deck.push(`${num}${suit}`);
        }
    }
    return deck;
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // swap
  }
  return deck;
}

// Draw a card 
function drawCard(deck) {
 // removes last card
  return deck.pop(); 
}

// Deal hands to players
function dealHands(deck, numPlayers, cardsPerPlayer) {
  const hands = [];
  for (let p = 0; p < numPlayers; p++) {
    hands[p] = [];
    for (let c = 0; c < cardsPerPlayer; c++) {
      hands[p].push(drawCard(deck));
    }
  }
  return hands;
}

// Example usage:
let deck = createDeck();
deck = shuffleDeck(deck);

// Deal 5 cards to 2 players
const hands = dealHands(deck, 2, 5); 
console.log("Player 1 hand:", hands[0]);
console.log("Player 2 hand:", hands[1]);
console.log("Remaining deck size:", deck.length);



