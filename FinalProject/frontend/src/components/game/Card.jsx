const valueMap = {1: 'ace', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'jack', 12: 'queen', 13: 'king'};
const suitMap = {H: 'hearts', D: 'diamonds', C: 'clubs', S: 'spades'};


function getCardImage(card) {
    if (card?.id && card.image) {
        return card.image;
    }
    

    const value = valueMap[card?.value] || card?.value;
    const suit = suitMap[card?.suit] || card?.suit;
    
    if (value && suit) {
        return `/cards/${value}_of_${suit}.png`;
    }

    return "/cards/back.png"; 
}


function Card({ card, faceUp, onDragStart }) {
  const imgSrc = getCardImage(card);

  return (
    <div className="card">
      <img
        src={faceUp ? imgSrc : "/cards/back.png"}
        alt={card?.id || "card"}
        draggable={faceUp}
        onDragStart={(e) => onDragStart?.(e, card)}
      />
    </div>
  );
}

export default Card;