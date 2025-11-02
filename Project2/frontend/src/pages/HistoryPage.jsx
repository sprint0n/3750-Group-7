import History from "../components/History";
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
  ];

  return (
    <div className={classes.container}>
      <h1>History</h1>
      <h3>Transaction History:</h3>
      <div className={classes.historyGrid}>
        {historyItems.map((item) => (
          <History key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}

export default HistoryPage;
