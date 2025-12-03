const suits = ["spades", "hearts", "diamonds", "clubs"];
const values = [
  "ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king",
];

export function createDeck() {
  const deck = [];

  for (let suit of suits) {
    for (let value of values) {
      deck.push({
        id: `${value}_of_${suit}`,
        value,
        suit,
        image: `/cards/${value}_of_${suit}.png`,
      });
    }
  }

  return shuffle(deck);
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}
