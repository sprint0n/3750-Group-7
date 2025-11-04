import History from "../components/History";
import TransferPieChart from "../components/TransferPieChart";
import classes from "./HistoryPage.module.css";

function HistoryPage() {
  //dummydata need real fetch from backend
  const historyItems = [
    {
      id: 1,
      type: "Deposit",
      category: "golfing",
      amount: 200,
      date: "2025-11-01",
    },
    {
      id: 2,
      type: "Withdraw",
      category: "shopping",
      amount: 50,
      date: "2025-10-30",
    },
    {
      id: 3,
      type: "Transfer",
      category: "gambling",
      amount: 100,
      date: "2025-10-29",
    },
    {
      id: 4,
      type: "Transfer",
      category: "shopping",
      amount: 80,
      date: "2025-10-27",
    },
  ];

  const totalsByCategory = Object.values(
    historyItems.reduce((acc, { category, amount }) => {
      acc[category] = acc[category] || { category, total: 0 };
      acc[category].total += amount;
      return acc;
    }, {})
  );

  return (
    <div className={classes.container}>
      <h1>History</h1>

      <div className={classes.content}>
        <div className={classes.historySection}>
          <h3>Transaction History:</h3>
          <div className={classes.historyList}>
            {historyItems.map((item) => (
              <History key={item.id} {...item} />
            ))}
          </div>
        </div>

        <div className={classes.chartSection}>
          <h3>Transactions by Category</h3>
          <TransferPieChart data={totalsByCategory} />
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
