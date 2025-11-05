import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import classes from "./LoginPage.module.css";
import { login } from "../api";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    //JM
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      await login(username.trim(), password); // call backend /api/login
      onLogin(true); // unlock protected routes
      navigate("/app/home");
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid credentials!";
      alert(msg);
    } finally {
      setLoading(false);
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

          <button
            type="submit"
            className={classes["login-button"]}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
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
