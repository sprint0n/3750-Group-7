import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // goes through the Vite proxy to :5000
  withCredentials: true, // keep session cookie working
});

// JM
export const me = () => api.get("/me");
export const getUsers = () => api.get("/getUsers");

export const register = (username, password) =>
  api.post("/register", { username, password });

export const login = (username, password) =>
  api.post("/login", { username, password });

export const logout = () => api.get("/logout");

// History / Summary
export const getTransfers = () => api.get("/getTransfers"); // all for the logged-in user
export const transfersFor = (account) => api.post("/TransfersFor", { account });
export const categorySummary = () => api.get("/CategorySummary");

// Money ops
export const deposit = ({ amount, account, category }) =>
  api.post("/deposit", { amount, account, category });

export const withdraw = ({ amount, account, category }) =>
  api.post("/withdraw", { amount, account, category });

// Transfers
export const internalTransfer = ({
  amount,
  fromAccount,
  toAccount,
  category,
}) =>
  api.post("/InternalTransfer", { amount, fromAccount, toAccount, category });

export const externalTransfer = ({
  amount,
  fromAccount,
  toAccount,
  targetUserId,
  category,
}) =>
  api.post("/ExternalTransfer", {
    amount,
    fromAccount,
    toAccount,
    targetUserId,
    category,
  });
