//This will be where all the game logic will go

//This creates the deck of cards
function createDeck(){
    const cardNum = [1,2,3,4,5,6,7,8,9,10,11,12,13];
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
  return deck.pop() || null; 
}

function initalizeGame(){
  let deck = createDeck();
  deck = shuffleDeck();

  const p1Hand = [];
  const p2Hand = [];
  const p1DrawPile = [];
  const p2DrawPile = [];
  let centerPile1 = [];
  let centerPile2 = [];

  for(let c = 0; c < 5; c++){
    p1Hand.push(drawCard(deck));
    p2Hand.push(drawCard(deck));
  }
  for(let c = 0; c < 15; c++){
    p1DrawPile.push(drawCard(deck));
    p2DrawPile.push(drawCard(deck));
  }
  centerPile1.push(drawCard(deck));
  centerPile2.push(drawCard(deck));

  return {
    player1ID: '',
    player2ID: '',
    status: 'waiting',
    deck: deck,
    player1: {hand: p1Hand, drawPile: p1DrawPile, isStalemate: false},
    player2: {hand: p2Hand, drawPile: p2DrawPile, isStalemate: false},
    center: {pile1: centerPile1, pile2: centerPile2},
  };
}



