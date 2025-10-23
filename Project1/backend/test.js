const alpha = require('alphavantage')({ key: 'RLBDFVMWEFSCSFRY' });

async function getStockPrice(symbol) {
  const data = await alpha.data.quote(symbol);
  console.log(data);
}

getStockPrice('AAPL');
