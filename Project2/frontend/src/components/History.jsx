import classes from "./History.module.css";

function History({ type, category, amount, date, account }) {
  return (
    <div className={classes.historyCard}>
      <p>
        <strong>Type:</strong> {type}
      </p>
      <p>
        <strong>Amount:</strong> ${amount}
      </p>
      <p>
        <strong>Category:</strong> {category}
      </p>
         <p>
        <strong>Account:</strong> {account}
      </p>
      <p>
        <strong>Date:</strong> {date}
      </p>
    </div>
  );
}

export default History;
