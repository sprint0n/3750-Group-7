import { useState, useEffect } from "react";
import "./HomePage.css";
import { me } from "../api";

const fmt = (n) =>
  Number.isFinite(Number(n))
    ? Number(n).toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
      })
    : "$0.00";

function HomePage() {
  const [checkingAccount, setCheckingAccount] = useState("$0.00");
  const [savingAccount, setSavingAccount] = useState("$0.00");
  const [otherAccount, setOtherAccount] = useState("$0.00");
  const [accountName, setAccountName] = useState("Other");
  const [form, setForm] = useState(false);

  const isForm = () => setForm((prev) => !prev);
  const handleCancel = () => {
    setForm(false);
    setAccountName("Other");
  };

  const loadBalances = async () => {
    try {
      const { data } = await me(); // { username, checking, savings, other }
      setCheckingAccount(fmt(data.checking));
      setSavingAccount(fmt(data.savings));
      setOtherAccount(fmt(data.other));
    } catch (e) {
      console.error("Failed to load balances:", e?.response?.data || e);
    }
  };

  useEffect(() => {
    loadBalances();
    // optional: refresh when tab regains focus
    const onFocus = () => loadBalances();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="home-container">
      <h1 className="welcome-text">Welcome Back</h1>

      <div className="account-card saving">
        <h2>Savings Account</h2>
        <p className="balance">{savingAccount}</p>
      </div>

      <div className="account-card checking">
        <h2>Checking Account</h2>
        <p className="balance">{checkingAccount}</p>
      </div>

      <div className="account-card checking">
        <h2>{accountName}</h2>
        <p className="balance">{otherAccount}</p>
        <button type="button" onClick={isForm}>
          Change Name
        </button>
        {/* Optional manual refresh button */}
        <button
          type="button"
          onClick={loadBalances}
          style={{ marginLeft: 0, marginTop: 10 }}
        >
          Refresh Balances
        </button>
      </div>

      {form && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setForm(false);
          }}
        >
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Enter new account name"
          />
          <button type="submit">Save</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default HomePage;
