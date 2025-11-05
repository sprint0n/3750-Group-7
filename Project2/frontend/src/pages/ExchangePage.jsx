import classes from "./ExchangePage.module.css";
import { useState } from "react";
import { deposit as apiDeposit, withdraw as apiWithdraw } from "../api"; // alias to avoid name clash

const normalizeAccount = (a) => (a === "saving" ? "savings" : a);

function ExchangePage() {
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const WithdrawnHandler = async () => {
    if (!fromAccount || !withdrawAmt || !category) {
      alert("please fill out the withdraw amount, category, and account");
      return;
    }
    const n = Number(withdrawAmt);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Withdraw amount must be > 0");
      return;
    }

    try {
      setLoading(true);
      const account = normalizeAccount(fromAccount);
      const { data } = await apiWithdraw({
        amount: n,
        account,
        category,
      });
      alert(data?.message || "Withdraw successful");
      setWithdrawAmt("");
      setCategory("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Withdrawal failed. Check funds and try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const DepositHandler = async () => {
    if (!fromAccount || !depositAmt || !category) {
      alert("please fill out the deposit amount, category, and account");
      return;
    }
    const n = Number(depositAmt);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Deposit amount must be > 0");
      return;
    }

    try {
      setLoading(true);
      const account = normalizeAccount(fromAccount);
      const { data } = await apiDeposit({
        amount: n,
        account,
        category,
      });
      alert(data?.message || "Deposit successful");
      setDepositAmt("");
      setCategory("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Deposit failed. Try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={classes.container}>
        <h1>Exchange Page</h1>
        <div className={classes["radio-button"]}>
          <label>
            <input
              type="radio"
              name="fromAccount"
              value="checking"
              checked={fromAccount === "checking"}
              onChange={(e) => setFromAccount(e.target.value)}
            />
            Checking
          </label>

          <label>
            <input
              type="radio"
              name="fromAccount"
              value="saving" // UI label normalized to "savings"
              checked={fromAccount === "saving"}
              onChange={(e) => setFromAccount(e.target.value)}
            />
            Savings
          </label>

          <label>
            <input
              type="radio"
              name="fromAccount"
              value="other"
              checked={fromAccount === "other"}
              onChange={(e) => setFromAccount(e.target.value)}
            />
            Other
          </label>
        </div>

        <div>
          <label htmlFor="category">Category:</label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Groceries, Rent, Bills"
          />
        </div>

        <div>
          <input
            type="number"
            value={withdrawAmt}
            onChange={(e) => setWithdrawAmt(e.target.value)}
            placeholder="Withdraw amount"
          />
          <button onClick={WithdrawnHandler} disabled={loading}>
            {loading ? "Processing…" : "Withdraw"}
          </button>
        </div>

        <div>
          <input
            type="number"
            value={depositAmt}
            onChange={(e) => setDepositAmt(e.target.value)}
            placeholder="Deposit amount"
          />
          <button onClick={DepositHandler} disabled={loading}>
            {loading ? "Processing…" : "Deposit"}
          </button>
        </div>
      </div>
    </>
  );
}

export default ExchangePage;
