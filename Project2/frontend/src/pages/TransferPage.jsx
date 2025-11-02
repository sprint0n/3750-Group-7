import { useState } from "react";
import classes from "./TransferPage.module.css";

function TransferPage() {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [transferAccount, settransferAccount] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [userID, setUserID] = useState("");

  const transferAccountHandler = () => {
    settransferAccount((prev) => !prev);
  };

  const handleAccountTransfer = (e) => {
    e.preventDefault();
    if (!userID || !accountNumber || !amount) {
      alert("Please fill in all fields");
      return;
    }

    alert(`Transfering ${amount} from your account ${account}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromAccount || !toAccount || !amount) {
      alert("Please select both accounts and enter an amount.");
      return;
    }

    if (fromAccount === toAccount) {
      alert("You cannot transfer to the same account!");
      return;
    }

    alert(
      `Transferring $${amount} from your ${fromAccount} account to your ${toAccount} account.`
    );
  };

  return (
    <>
      <h1>Transfer</h1>
      {!transferAccount && (
        <form onSubmit={handleSubmit}>
          <div>
            <h3>Select the account to transfer FROM:</h3>

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
            <h3>Select the account to transfer TO:</h3>

            <label>
              <input
                type="radio"
                name="toAccount"
                value="checking"
                checked={toAccount === "checking"}
                onChange={(e) => setToAccount(e.target.value)}
              />
              Checking
            </label>

            <label>
              <input
                type="radio"
                name="toAccount"
                value="saving"
                checked={toAccount === "saving"}
                onChange={(e) => setToAccount(e.target.value)}
              />
              Savings
            </label>

            <label>
              <input
                type="radio"
                name="toAccount"
                value="other"
                checked={toAccount === "other"}
                onChange={(e) => setToAccount(e.target.value)}
              />
              Other
            </label>
          </div>
          <div className={classes.inputGroup}>
            <label htmlFor="category">Category:</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter a category (e.g. Bills, Rent, Food)"
            />
          </div>

          <div>
            <label htmlFor="amount">Amount:</label>
            <input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <button type="submit">Transfer</button>
          <button type="button" onClick={transferAccountHandler}>
            Account Transfer
          </button>
          <p>
            From: {fromAccount || "None"} → To: {toAccount || "None"}
          </p>
        </form>
      )}
      {transferAccount && (
        <form>
          <div>
            <h3>Select the account to transfer FROM:</h3>

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

          <div className={classes.inputGroup}>
            <label htmlFor="category">Category:</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter a category (e.g. Bills, Rent, Food)"
            />
          </div>

          <div className={classes.inputGroup}>
            <label htmlFor="userId">Account ID:</label>
            <input
              id="userId"
              type="number"
              value={userID}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="userID"
            />
          </div>

          <div>
            <label htmlFor="accountNumber">Account Number: </label>
            <input
              id="accountnum"
              type="number"
              value={accountNumber}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Account Number"
            />
          </div>

          <div>
            <label htmlFor="Amount">Amount: </label>
            <input
              id="Amount2"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <button type="submit" onClick={handleAccountTransfer}>
            Transfer
          </button>

          <button type="button" onClick={transferAccountHandler}>
            Cancel
          </button>
        </form>
      )}
    </>
  );
}

export default TransferPage;
