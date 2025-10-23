const alpha = require('alphavantage')({ key: 'RLBDFVMWEFSCSFRY' });
const express = require("express");
const stockRoutes = express.Router();
// beginning variables for the game to start
let investment = 0;
let money = 10000;
let ticker = "";
let stockPrice = 0;
let overallTotal = 0;
let history = [];
let numofStocks = 0;
let currentIndex = 0;

//This is a function to get a random starting date 6 months ago
function getRandomStartingDate() {
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  const randomDay = Math.floor(Math.random() * 28) + 1;
  sixMonthsAgo.setDate(randomDay);

  return sixMonthsAgo;
}


//This is a test to makesure that the backend is working
stockRoutes.route("/test").get(function (req, res) {
  console.log("In test route");
  res.json({ message: "Backend is working!" });
});

//This takes the user's input of theticker stock
stockRoutes.route("/PostTicker").post(function (req, res) {
  console.log("In PostTicker route");
  ticker = req.body.ticker;
  console.log("Ticker: " + ticker);
  res.status(200).json({ message: "Received!" });
});

//This gets the ticker from the input then generates a random day
stockRoutes.route("/getTicker").get(async function (req, res) {
  console.log("In getTicker route");

  try {
    ticker = ticker || "AAPL";
    console.log("Ticker:", ticker);

    // Get random date and move 6 months back
    const sixMonthsAgo = getRandomStartingDate();
    const strMonthsAgo = sixMonthsAgo.toISOString().split("T")[0];
    console.log("Base date six months ago:", strMonthsAgo);

    // Fetch full daily data
    const data = await alpha.data.daily(ticker, "full");
    const timeSeries = data["Time Series (Daily)"];

    history = [];

    // Loop through 7 consecutive trading days after base date
    for (let i = 0; i < 12; i++) {
      const historyDate = new Date(sixMonthsAgo);
      historyDate.setDate(sixMonthsAgo.getDate() + i);
      const strHistoryDate = historyDate.toISOString().split("T")[0];

      const dayData = timeSeries[strHistoryDate];
      if (dayData) {
        const historyPrice = dayData["4. close"];
        history.push({ date: strHistoryDate, price: historyPrice });
      }
    }

    // Set the current price to the first available price
    if (history.length > 0) {
      stockPrice = parseFloat(history[0].price);
    }

    console.log("History:", history);

    res.json({
      ticker,
      baseDate: strMonthsAgo,
      history,
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
  }
});

//This gets the investment amount from the user and buys them
stockRoutes.route("/PostInvestment").post(async function (req, res) {
  try {
    const stocksToBuy = parseFloat(req.body.numStocks);
    const cost = stocksToBuy * stockPrice;
    
    numofStocks += stocksToBuy;
    money -= cost;
    investment = numofStocks * stockPrice;

    console.log("Investment: " + investment);
    console.log("Number of Stocks: " + numofStocks);
    console.log("Money: " + money);
    console.log("Overall Total: " + overallTotal);
    res.json({ investment: investment.toFixed(2), money: money.toFixed(2), numofStocks: numofStocks.toFixed(4) });
    
  } catch (error) {
    console.error("Error fetching investment data:", error);
  }
});


//This will get the sell value of the stock from the api and do the calculations for how much money is gained or lost
stockRoutes.route("/PostSale").post(async function (req, res) {
  console.log("In PostSale route");
  //fetch the sell value from the api
  try {
      const saleAmount = parseFloat(req.body.saleAmount);
      console.log("Starting Money: " + money);
      
      if(saleAmount > numofStocks + 0.0001){
        return res.status(400).json({error: `Cannot Sell ${saleAmount.toFixed(2)}. Current held value is ${numofStocks.toFixed(2)}`});
      }

      const revenue = saleAmount * stockPrice;
      numofStocks -= saleAmount;
      money += revenue;
      investment = numofStocks * stockPrice; 
    
    console.log("Sale Amount: " + revenue);
    console.log("Shares Sold: " + saleAmount);
    console.log("Remaining Stocks: " + numofStocks);
    console.log("New Money: " + money);
    console.log("New Investment Value: " + investment);

res.json({investement: investment.toFixed(2), money: money.toFixed(2), numofStocks: numofStocks.toFixed(4)})
  } catch (error) {
    console.error("Error fetching stock data:", error);
  }
});

//This will do the next day in the array then increase or decrease the investment due to the stock price change
stockRoutes.route("/nextRound").get(async function (req, res) {
  console.log("In nextRound route");
   try {
    if (history.length === 0) {
      return;
    }

    // Move to next day if possible
    if (currentIndex < history.length - 1) {
      currentIndex++;
    }else{
      console.log("No more days left in history.");
      return;
    }

    // Get new stock price
    const newPrice = parseFloat(history[currentIndex].price);
    const oldPrice = stockPrice || parseFloat(history[currentIndex - 1].price);
    stockPrice = newPrice;

    investment = numofStocks * stockPrice;

    console.log(`Day: ${history[currentIndex].date}`);
    console.log(`Old Price: ${oldPrice}, New Price: ${newPrice}`);
    console.log(`Investment: ${investment}`);

    res.json({
      date: history[currentIndex].date,
      stockPrice: stockPrice.toFixed(4),
      investment: investment.toFixed(2),
    });
  } catch (error){
    console.error("Error fetching stock data:", error);
  }
});

//This will end the game and return the final money value and overall profit or loss
stockRoutes.route("/endGame").get(async function (req, res) {
  try{

  const finalSell = stockPrice * numofStocks;
  money = money + finalSell;

  numofStocks = 0.0;
  investment = 0.0;

  console.log("In endGame route");
  res.json({ finalMoney: money.toFixed(2)});
  } catch(error){
    console.error("Error fetching end game data:", error);
  }
});

module.exports = stockRoutes;
