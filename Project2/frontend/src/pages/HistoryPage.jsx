import { useEffect, useState, useCallback } from "react";
import History from "../components/History";
import TransferPieChart from "../components/TransferPieChart";
import classes from "./HistoryPage.module.css";
import { getTransfers, categorySummary, transfersFor } from "../api";

function HistoryPage() {
  const [historyItems, setHistoryItems] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pieLoading, setPieLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchAccount, setSearchAccount] = useState("allAccounts");

  const mapTransfers = useCallback((data) => {
    const nameFromId = (s) =>
      typeof s === "string" && s !== "EXTERNAL" ? s.split("_")[0] : null;

    return (data || []).map((t, idx) => {
      const rawDate = t.TransferDate || t.transferDate;
      const when = rawDate ? new Date(rawDate) : null;

      const from = t.AccountTransferedFrom;
      const to = t.AccountTransferedTo;

      let accountText = "";
      if (from === "EXTERNAL") {
        accountText = nameFromId(to) || "";
      } else if (to === "EXTERNAL") {
        accountText = nameFromId(from) || "";
      } else {
        const f = nameFromId(from);
        const tn = nameFromId(to);
        accountText = f && tn ? `${f} → ${tn}` : f || tn || "";
      }

      return {
        id: t._id || idx,
        type: t.TransferType,
        category: t.TransferCategory,
        amount: Number(t.AmountTransferred || 0),
        date: when ? when.toLocaleString() : "",
        account: accountText,
      };
    });
  }, []);


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setPieLoading(true);
        const { data } = await categorySummary();
        const normalized = (data || []).map((d, i) => ({
          category: d._id || `Category ${i + 1}`,
          total: Number(d.totalAmount || 0),
        }));
        if (mounted) setPieData(normalized);
      } finally {
        if (mounted) setPieLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  //reload history when account changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const resp =
          searchAccount === "allAccounts"
            ? await getTransfers()
            : await transfersFor(searchAccount);
        if (!mounted) return;
        setHistoryItems(mapTransfers(resp?.data));
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load history.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [searchAccount, mapTransfers]);

  return (
    <div className={classes.container}>
      <h1>History</h1>

      <div className={classes.content}>
        <div className={classes.historySection}>
          <h3>Transaction History:</h3>

          <div>
            <h3>Select account to see history</h3>

            <label>
              <input
                type="radio"
                value="checking"
                checked={searchAccount === "checking"}
                onChange={(e) => setSearchAccount(e.target.value)}
              />
              Checking
            </label>

            <label>
              <input
                type="radio"
                value="savings"
                checked={searchAccount === "savings"}
                onChange={(e) => setSearchAccount(e.target.value)}
              />
              Savings
            </label>

            <label>
              <input
                type="radio"
                value="other"
                checked={searchAccount === "other"}
                onChange={(e) => setSearchAccount(e.target.value)}
              />
              Other
            </label>

            <label>
              <input
                type="radio"
                value="allAccounts"
                checked={searchAccount === "allAccounts"}
                onChange={(e) => setSearchAccount(e.target.value)}
              />
              All accounts
            </label>
          </div>

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
