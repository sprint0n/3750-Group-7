import { useState, useCallback } from "react";
import "./App.css";
import TradePanel from "./components/TradePanel";

function App() {
  const [ticker, setTicker] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [day, setDay] = useState(1);
  const [bankBalance, setBankBalance] = useState(10000);
  const [investmentValue, setInvestmentValue] = useState(0.0);
  const [mode, setMode] = useState("main"); // main | trade | summary
  const [tradeType, setTradeType] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0.0);
  const [numStocks, setNumStocks] = useState(0.0);




  const advanceToNextDay = useCallback(async () => {
  
    const response = await fetch("http://localhost:4000/nextRound");
    const result= await response.json();
    setCurrentDate(result.date);
    setCurrentPrice(parseFloat(result.stockPrice));
    setInvestmentValue(parseFloat(result.investment));
    setDay((prev) => prev + 1);

    
  }, []);
  // ticker input
  const handleSubmitTicker =  async (e) => {
    e.preventDefault();
    if (ticker.trim() === "") {
      alert("Please enter a ticker symbol before continuing.");
      return;
    }
    const postResponse = await fetch("http://localhost:4000/PostTicker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ticker: ticker})
    });
    const postData = await postResponse.json();
    if (!postResponse.ok) {
        throw new Error(postData.error || `Failed to post ticker (Status: ${postResponse.status})`);
      }
    const gameValuesResponse = await fetch("http://localhost:4000/getTicker");
    const gameValues = await gameValuesResponse.json();
    setCurrentPrice(parseFloat(gameValues.history[0].price));
    setCurrentDate(gameValues.history[0].date);
    setSubmitted(true);
    setBankBalance(10000.0);
    setInvestmentValue(0.0);
    setNumStocks(0.0);
    setDay(1);
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
  const handleTradeSubmit = async (amount) => {
      const amountToTrade = parseFloat(amount.toFixed(4));

      if(tradeType == "buy"){
        const buyResponse = await fetch("http://localhost:4000/PostInvestment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({numStocks: amountToTrade}),
        });

        const result = await buyResponse.json();

        setBankBalance(parseFloat(result.money));
        setInvestmentValue(parseFloat(result.investment));
        setNumStocks(parseFloat(result.numofStocks));
      }else if (tradeType == "sell"){
         const sellResponse = await fetch("http://localhost:4000/PostSale", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({saleAmount: amountToTrade}),
        });
        const result = await sellResponse.json();
        setBankBalance(parseFloat(result.money));
        setInvestmentValue(parseFloat(result.investment));
        setNumStocks(parseFloat(result.numofStocks));
      }

      await advanceToNextDay();
      setMode("main");
  };

  const handleCancelTrade = () => {
    setMode("main");
  };

  // quit xd
  const handleQuit = async () => {
    const quitResponse = await fetch("http://localhost:4000/endGame");
    const result = await quitResponse.json();

    setBankBalance(parseFloat(result.finalMoney));
    setInvestmentValue(0.0);
    setNumStocks(0.0);
    setMode("summary");
  };


  const handleHold = () => {
    advanceToNextDay();
  }


  const finalGainLoss =  bankBalance - 10000;
  



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
            investmentValue={investmentValue}
            numStocks={numStocks}
            currentPrice={currentPrice}
            onSubmit={handleTradeSubmit}
            onCancel={handleCancelTrade}
        />
      ) : mode === "summary" ? (
        // Summary screen
        <div className="summary-screen">
          <h2>Game Summary</h2>
          <p>
            <strong>Total Gain/Loss:</strong> ${finalGainLoss.toLocaleString()}
          </p>
          <p>
            <strong>Time Spent:</strong> {day - 1} day{day - 1 !== 1 ? "s" : ""}
          </p>
          <div className="result-box">
            <p>
              {finalGainLoss >= 0
                ? `Gain: $${finalGainLoss.toLocaleString()}`
                : `Loss: $${Math.abs(finalGainLoss).toLocaleString()}`}
            </p>
            <p>
              Final Balance: ${bankBalance}
            </p>
          </div>
        
        </div>
      ) : (
        // Game screen and options
        <div className="game-screen">
          <h3>Day {day}</h3>
          <div className="balances">
            <p>
              Your Balance is:{" "}
              <span className="money">${bankBalance}</span>
            </p>
            <p>The Current Stock Price is: ${currentPrice.toFixed(4)}</p>
            <p>Your Stock Balance is: {numStocks.toFixed(4)}</p>
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
              onClick={handleHold}
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
