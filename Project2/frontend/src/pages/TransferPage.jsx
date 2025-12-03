import { useState } from "react";
import classes from "./TransferPage.module.css";
import { internalTransfer, externalTransfer } from "../api";

function TransferPage() {
  const [fromAccount, setFromAccount] = useState("");
  const [fromAccount2, setFromAccount2] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [transferAccount, settransferAccount] = useState(false);
  const [category2, setCategory2] = useState("");
  const [amount2, setAmount2] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [userID, setUserID] = useState("");
  const normalize = (a) => (a === "saving" ? "savings" : a);

  const transferAccountHandler = () => {
    settransferAccount((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    //JM
    e.preventDefault();

    if (!fromAccount || !toAccount || !amount || !category) {
      alert("Please select both accounts, enter an amount, and a category.");
      return;
    }
    if (fromAccount === toAccount) {
      alert("You cannot transfer to the same account!");
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Amount must be > 0");
      return;
    }

    try {
      const { data } = await internalTransfer({
        amount: n,
        fromAccount: normalize(fromAccount),
        toAccount: normalize(toAccount),
        category,
      });
      alert(data?.message || "Internal transfer successful");
      setAmount("");
      setCategory("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Internal transfer failed.";
      alert(msg);
    }
  };

  const handleGlobalAccountTransfer = async (e) => {
    //JM

    e.preventDefault();

    if (!userID || !accountNumber || !fromAccount2 || !amount2 || !category2) {
      alert("Fill out all fields");
      return;
    }
    const n = Number(amount2);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Amount must be > 0");
      return;
    }

    const toAccount =
      Number(accountNumber) === 1
        ? "checking"
        : Number(accountNumber) === 2
        ? "savings"
        : "other";

    try {
      const { data } = await externalTransfer({
        amount: n,
        fromAccount: normalize(fromAccount2),
        toAccount,
        targetUserId: userID, // Mongo ObjectId string
        category: category2,
      });
      alert(data?.message || "External transfer successful");
      setAmount2("");
      setCategory2("");
      setUserID("");
      setAccountNumber("");
    } catch (err) {
      const msg = err?.response?.data?.message || "External transfer failed.";
      alert(msg);
    }
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
                checked={fromAccount2 === "checking"}
                onChange={(e) => setFromAccount2(e.target.value)}
              />
              Checking
            </label>

            <label>
              <input
                type="radio"
                name="fromAccount"
                value="saving"
                checked={fromAccount2 === "saving"}
                onChange={(e) => setFromAccount2(e.target.value)}
              />
              Savings
            </label>

            <label>
              <input
                type="radio"
                name="fromAccount"
                value="other"
                checked={fromAccount2 === "other"}
                onChange={(e) => setFromAccount2(e.target.value)}
              />
              Other
            </label>
          </div>

          <div className={classes.inputGroup}>
            <label htmlFor="category">Category:</label>
            <input
              id="category2"
              type="text"
              value={category2}
              onChange={(e) => setCategory2(e.target.value)}
              placeholder="Enter a category (e.g. Bills, Rent, Food)"
            />
          </div>

          <div className={classes.inputGroup}>
            <label htmlFor="userId">Account ID:</label>
            <input
              id="userId"
              type="text" //not number, Mongo ObjectId string
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              placeholder="userID"
            />
          </div>

          <div>
            <label htmlFor="accountNumber">Account Number: </label>
            <input
              id="accountnum"
              type="number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter Account Number"
            />
          </div>

          <div>
            <label htmlFor="Amount">Amount: </label>
            <input
              id="Amount2"
              type="number"
              value={amount2}
              onChange={(e) => setAmount2(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <button type="submit" onClick={handleGlobalAccountTransfer}>
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
