import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import classes from "./LoginPage.module.css";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    //change this later for the password and login logic
    if (username === "admin" && password === "1234") {
      onLogin(true);
      navigate("/app/home");
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className={classes["login-wrapper"]}>
      <div className={classes["login-box"]}>
        <h1 className={classes["login-title"]}>
          Welcome to Three Musketeer Banking
        </h1>
        <h2 className={classes["login-title"]}>Sign in</h2>
        <form className={classes["login-form"]} onSubmit={submitHandler}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className={classes["login-button"]}>
            Login
          </button>
        </form>
        <p className={classes["login-footer"]}>
          Don't have an account? <Link to="/create">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
