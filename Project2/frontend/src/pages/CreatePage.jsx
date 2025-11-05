// src/pages/CreatePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./CreatePage.module.css";
import { register } from "../api";

function CreatePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => { //JM
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      alert("Please enter in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Please match the passwords");
      return;
    }

    try {
      setLoading(true);
      const { data } = await register(username.trim(), password);
      alert(data?.message || "Account created successfully!");
      navigate("/"); // back to Login
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes["create-wrapper"]}>
      <div className={classes["create-box"]}>
        <h1 className={classes["create-title"]}>Create an account</h1>
        <form className={classes["create-form"]} onSubmit={submitHandler}>
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

          <button
            className={classes["create-button"]}
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePage;
