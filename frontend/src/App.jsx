import { useState } from "react";
import "./App.css";
import TradePanel from "./components/TradePanel";

function App() {
  const [ticker, setTicker] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [day, setDay] = useState(1);
  const [bankBalance, setBankBalance] = useState(10000);
  const [stockBalance, setStockBalance] = useState(0);
  const [mode, setMode] = useState("main"); // main | trade | summary
  const [tradeType, setTradeType] = useState(null);
  const [startingBalance] = useState(10000); // to calculate gain/loss

  // ticker input
  const handleSubmitTicker = (e) => {
    e.preventDefault();
    if (ticker.trim() === "") {
      alert("Please enter a ticker symbol before continuing.");
      return;
    }
    setSubmitted(true);
  };

  // Buy and sell stuff
  const handleBuy = () => {
    setTradeType("buy");
    setMode("trade");
  };

  const handleSell = () => {
    setTradeType("sell");
    setMode("trade");
  };

  // Panel for trading / REPLACE MY LOGIC WITH THE BACKEDN REQUEST!
  const handleTradeSubmit = (amount) => {
    if (tradeType === "buy") {
      if (amount > bankBalance) {
        alert("Insufficient funds!");
        return;
      }
      setBankBalance((prev) => prev - amount);
      setStockBalance((prev) => prev + amount);
    } else if (tradeType === "sell") {
      if (amount > stockBalance) {
        alert("You don’t have enough stocks to sell!");
        return;
      }
      setStockBalance((prev) => prev - amount);
      setBankBalance((prev) => prev + amount);
    }

    setDay((prev) => prev + 1);
    setMode("main");
  };

  const handleCancelTrade = () => {
    setMode("main");
  };

  // quit xd
  const handleQuit = () => {
    setMode("summary");
  };

  // silly calculation about the gain/loss, but I don't know if is working xd, I didn't test it
  const totalBalance = bankBalance + stockBalance;
  const gainLoss = totalBalance - startingBalance;

  return (
    <div className="container">
      {!submitted ? (
        // Ticker Input Screen
        <form className="ticker-form" onSubmit={handleSubmitTicker}>
          <input
            type="text"
            placeholder="Enter Ticker Symbol"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="ticker-input"
          />
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      ) : mode === "trade" ? (
        // Trade screen
        <TradePanel
          type={tradeType}
          bankBalance={bankBalance}
          stockBalance={stockBalance}
          onSubmit={handleTradeSubmit}
          onCancel={handleCancelTrade}
        />
      ) : mode === "summary" ? (
        // Summary screen
        <div className="summary-screen">
          <h2>Game Summary</h2>
          <p>
            <strong>Total Gain/Loss:</strong> ${gainLoss.toLocaleString()}
          </p>
          <p>
            <strong>Time Spent:</strong> {day - 1} day{day - 1 !== 1 ? "s" : ""}
          </p>
          <div className="result-box">
            <p>
              {gainLoss >= 0
                ? `Gain: $${gainLoss.toLocaleString()}`
                : `Loss: $${Math.abs(gainLoss).toLocaleString()}`}
            </p>
          </div>
          <button
            className="submit-btn"
            onClick={() => window.location.reload()}
          >
            Play Again
          </button>
        </div>
      ) : (
        // Game screen and options
        <div className="game-screen">
          <h3>Day {day}</h3>
          <div className="balances">
            <p>
              Your Balance is:{" "}
              <span className="money">${bankBalance.toLocaleString()}</span>
            </p>
            <p>Your Stock Balance is: ${stockBalance.toLocaleString()}</p>
          </div>
          <div className="button-group">
            <button className="action-btn" onClick={handleBuy}>
              Buy
            </button>
            <button className="action-btn" onClick={handleSell}>
              Sell
            </button>
            <button
              className="action-btn"
              onClick={() => setDay((prev) => prev + 1)}
            >
              Hold
            </button>
            <button className="action-btn quit" onClick={handleQuit}>
              Quit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
