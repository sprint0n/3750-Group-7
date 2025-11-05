import { useEffect, useState } from "react";
import History from "../components/History";
import TransferPieChart from "../components/TransferPieChart";
import classes from "./HistoryPage.module.css";
import { getTransfers, categorySummary } from "../api";

function HistoryPage() {
  const [historyItems, setHistoryItems] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pieLoading, setPieLoading] = useState(true);
  const [error, setError] = useState("");
  // I PRETTY MUCH HAD TO CODE THIS FROM SCRATCH xd, FUCK THISSSS
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const { data } = await getTransfers();
        const mapped = (data || []).map((t, idx) => {
          const rawDate = t.TransferDate || t.transferDate;
          return {
            id: t._id || idx,
            type: t.TransferType,
            category: t.TransferCategory,
            amount: Number(t.AmountTransferred || 0),
            date: rawDate ? new Date(rawDate).toLocaleString() : "",
          };
        });
        if (mounted) setHistoryItems(mapped);
      } catch (err) {
        if (mounted)
          setError(err?.response?.data?.message || "Failed to load history.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    (async () => {
      try {
        setPieLoading(true);
        const { data } = await categorySummary();
        const normalized = (data || []).map((d, i) => ({
          category: d._id || `Category ${i + 1}`,
          total: Number(d.totalAmount || 0),
        }));
        if (mounted) setPieData(normalized);
      } catch {
      } finally {
        if (mounted) setPieLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={classes.container}>
      <h1>History</h1>

      <div className={classes.content}>
        <div className={classes.historySection}>
          <h3>Transaction History:</h3>

          {loading ? (
            <p>Loading transactions…</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : historyItems.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <div className={classes.historyList}>
              {historyItems.map((item) => (
                <History key={item.id} {...item} />
              ))}
            </div>
          )}
        </div>

        <div className={classes.chartSection}>
          <h3>Transactions by Category</h3>
          {pieLoading ? (
            <p>Loading chart…</p>
          ) : (
            <TransferPieChart data={pieData} />
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
