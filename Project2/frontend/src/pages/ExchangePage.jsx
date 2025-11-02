import classes from "./ExchangePage.module.css";
import { useState } from "react";

function ExchangePage() {
  const [deposit, setDeposit] = useState("");
  const [withdrawn, setWithdrawn] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [category, setCategory] = useState("");

  const WithdrawnHandler = () => {
    console.log("Withdrawing:", withdrawn);
  };

  const DepositHandler = () => {
    console.log("Depositing:", deposit);
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
              value="saving"
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
            value={withdrawn}
            onChange={(e) => setWithdrawn(e.target.value)}
            placeholder="Withdraw amount"
          />
          <button onClick={WithdrawnHandler}>Withdraw</button>
        </div>

        <div>
          <input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="Deposit amount"
          />
          <button onClick={DepositHandler}>Deposit</button>
        </div>
      </div>
    </>
  );
}

export default ExchangePage;
