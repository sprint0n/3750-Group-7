import { useState, useEffect, useRef } from "react";
import "./TradePanel.css";

export default function TradePanel({
  type, // buy or sell, no more xd
  bankBalance,
  investmentValue,
  onSubmit,
  onCancel,
  currentPrice,
  numStocks
}) {
  const [numShares, setNumShares] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pieRef = useRef(null);

const isBuy = type === "buy";
const maxShares = isBuy 
    ? (currentPrice > 0 ? (bankBalance / currentPrice) : 0) 
    : numStocks; 

  // just update values
  useEffect(() => {
    if (numShares > maxShares){
      setNumShares(parseFloat(maxShares.toFixed(4)));
    }
  });

  // just update between 0 and max
  const handleChange = (newVal) => {
    const value = Math.max(0, Math.min(newVal, maxShares));
    setNumShares(parseFloat(value.toFixed(4)));
  };

  // submit transaction
  const handleSubmit = () => {
    if (numShares <= 0) {
      alert("Please select an amount greater than 0.");
      return;
    }
    onSubmit(numShares);
  };

  // PIE CHART, CHECK THIS SHIT OUT XDXDXDXDXD
  const handleStartDrag = (e) => {
    setDragging(true);
    updatePieValue(e);
  };

  const handleDrag = (e) => {
    if (!dragging) return;
    updatePieValue(e);
  };

  const handleEndDrag = () => {
    setDragging(false);
  };

  const updatePieValue = (e) => {
    const rect = pieRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 180;
    const percent = Math.min(Math.max(angle / 360, 0), 1);
    const newAmount = Math.round(percent * maxShares);
    handleChange(parseFloat(newAmount.toFixed(4)));
  };

  const piePercent = maxShares === 0 ? 0 : (numShares / maxShares) * 100;

  const monValue = numShares * currentPrice;

  return (
    <div
      className="trade-container"
      onMouseMove={handleDrag}
      onMouseUp={handleEndDrag}
      onMouseLeave={handleEndDrag}
    >
      <h3>{type === "buy" ? "Buy Stocks" : "Sell Stocks"}</h3>
      <p>Current Price: <span className="font-bold text-indigo-500">${currentPrice.toFixed(2)}</span></p>

      <div className="balances">
        <p>Current Balance: ${bankBalance.toLocaleString()}</p>
        <p>Your Stock Balance: {numStocks.toLocaleString()}</p>
        <p>
          Amount of stocks to {type === "buy" ? "Buy" : "Sell"}: {numShares.toFixed(4)}
          Value in USD: ${monValue.toFixed(4)}
        </p>
      </div>

      <div className="inputs">
        {/*Pie Chart*/}
        <div className="pie-container">
          <div
            className="pie"
            ref={pieRef}
            onMouseDown={handleStartDrag}
            title="Drag around the circle to adjust amount"
          >
            <div
              className="pie-fill"
              style={{
                background: `conic-gradient(#007bff ${
                  piePercent * 3.6
                }deg, #ddd 0deg)`,
              }}
            ></div>

            {/*Handle indicator*/}
            <div
              className="handle-dot"
              style={{
                transform: `rotate(${piePercent * 3.6}deg) translate(70px)`,
              }}
            ></div>
          </div>
        </div>

        {/*Slider*/}
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max={maxShares}
            value={numShares}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="slider"
          />
        </div>

        {/*Textbox*/}
        <div className="textbox-container">
          <label htmlFor="amount" className="textbox-label">
            Enter an amount:
          </label>
          <input
            id="amount"
            type="number"
            value={numShares}
            min="0"
            max={maxShares}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="textbox"
          />
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleSubmit} className="submit-btn">
          Submit
        </button>
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
}
