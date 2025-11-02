import { useState, useEffect } from "react";
import "./HomePage.css";

function HomePage() {
  const [checkingAccount, setCheckingAccount] = useState("");
  const [savingAccount, setSavingAccount] = useState("");
  const [otherAccount, setOtherAccount] = useState("");
  const [accountName, setAccountName] = useState("Other");
  const [form, setForm] = useState(false);

  const isForm = () => {
    setForm((prev) => !prev);
  };

  useEffect(() => {
    //this will be where we need to take from the backend
    const dummyData = {
      checking: "$1,245.50",
      saving: "$8,920.75",
      other: "$9,002.89",
    };
    setCheckingAccount(dummyData.checking);
    setSavingAccount(dummyData.saving);
    setOtherAccount(dummyData.other);
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
          <button type="button" onClick={isForm}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default HomePage;
