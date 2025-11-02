import { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./CreatePage.module.css";

function CreatePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const SubmitHandler = () => {
    if (!username || !password || !confirmPassword) {
      alert("Please enter in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Please match the passwords");
      return;
    }

    alert("Account created successfully!");
    //Add the fetch calls

    navigate("/");
  };

  return (
    <div className={classes["create-wrapper"]}>
      <div className={classes["create-box"]}>
        <h1 className={classes["create-title"]}>Create an account</h1>
        <form
          className={classes["create-form"]}
          onSubmit={(e) => {
            e.preventDefault();
            SubmitHandler();
          }}
        >
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className={classes["create-button"]} type="submit">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePage;
