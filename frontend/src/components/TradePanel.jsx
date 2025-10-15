import { useState, useEffect, useRef } from "react";
import "./TradePanel.css";

export default function TradePanel({
  type, // buy or sell, no more xd
  bankBalance,
  stockBalance,
  onSubmit,
  onCancel,
}) {
  const [amount, setAmount] = useState(0);
  const [maxValue, setMaxValue] = useState(10000);
  const [dragging, setDragging] = useState(false);
  const pieRef = useRef(null);

  // just update values
  useEffect(() => {
    if (type === "buy") setMaxValue(bankBalance);
    else setMaxValue(stockBalance);
  }, [type, bankBalance, stockBalance]);

  // just update between 0 and max
  const handleChange = (newVal) => {
    const value = Math.max(0, Math.min(newVal, maxValue));
    setAmount(value);
  };

  // submit transaction
  const handleSubmit = () => {
    if (amount <= 0) {
      alert("Please select an amount greater than 0.");
      return;
    }
    onSubmit(amount);
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
    const newAmount = Math.round(percent * maxValue);
    handleChange(newAmount);
  };

  const piePercent = maxValue === 0 ? 0 : (amount / maxValue) * 100;

  return (
    <div
      className="trade-container"
      onMouseMove={handleDrag}
      onMouseUp={handleEndDrag}
      onMouseLeave={handleEndDrag}
    >
      <h3>{type === "buy" ? "Buy Stocks" : "Sell Stocks"}</h3>

      <div className="balances">
        <p>Current Balance: ${bankBalance.toLocaleString()}</p>
        <p>Your Stock Balance: ${stockBalance.toLocaleString()}</p>
        <p>
          Amount to {type === "buy" ? "Buy" : "Sell"}: ${amount}
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
            max={maxValue}
            value={amount}
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
            value={amount}
            min="0"
            max={maxValue}
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
