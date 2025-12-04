function Card({ card, faceUp, onDragStart }) {
  return (
    <div className="card">
      <img
        src={faceUp ? card.image : "/cards/back.png"}
        alt={card?.id || "card"}
        draggable={faceUp}
        onDragStart={(e) => onDragStart?.(e, card)}
      />
    </div>
  );
}

export default Card;
