const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const { ObjectId } = require("mongodb");
const crypto = require("crypto");

const db = dbo.getDB();
const userCollection = db.collection("Users");
const transferCollection = db.collection("Transfers");

// ---- account helpers ----
const ACCOUNT_NAME_BY_NUM = { 1: "checking", 2: "savings", 3: "other" };
function normalizeAccount(input) {
  if (input === undefined || input === null) return null;
  const s = String(input).trim().toLowerCase();
  if (ACCOUNT_NAME_BY_NUM[s]) return ACCOUNT_NAME_BY_NUM[s];
  if (["checking", "savings", "other"].includes(s)) return s;
  return null;
}

function genSalt() {
  return crypto.randomBytes(16).toString("hex");
}
function hashPassword(password, salt) {
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

recordRoutes.route("/getUsers").get(async (_req, res) => {
  try {
    const results = await userCollection.find({}).toArray();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

recordRoutes.route("/register").post(async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Missing registration fields." });

    const existing = await userCollection.findOne({ username });
    if (existing)
      return res.status(409).json({ message: "Username already taken." });

    const salt = genSalt();
    const hashedPassword = hashPassword(password, salt);

    const newUser = {
      username,
      salt,
      hashedPassword,
      checking: 0,
      savings: 0,
      other: 0,
    };

    const result = await userCollection.insertOne(newUser);
    req.session.username = username;
    req.session.userId = result.insertedId;
    res
      .status(201)
      .json({ message: "Registration successful. Please log in." });
  } catch (err) {
    console.error("Registration failed:", err);
    res.status(500).json({ message: "Unexpected error during registration." });
  }
});

recordRoutes.route("/login").post(async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userCollection.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.hashedPassword)
      return res.status(401).json({ message: "Invalid username or password" });

    req.session.username = user.username;
    req.session.userId = user._id;
    res.status(200).json({ message: "Log in successful." });
  } catch (err) {
    console.error("Log in failed:", err);
    res.status(500).json({ message: "Unexpected error during log in." });
  }
});

recordRoutes.route("/getTransfers").get(async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "User not logged in." });
  try {
    const userIdString = req.session.userId.toString();
    const userCheck = new RegExp(`_${userIdString}`);

    const results = await transferCollection
      .find({
        $or: [
          { AccountTransferedFrom: userCheck },
          { AccountTransferedTo: userCheck },
        ],
      })
      .sort({ TransferDate: -1, transferDate: -1 })
      .toArray();

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching transfers.");
  }
});

recordRoutes.route("/deposit").post(async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "User not logged in." });
  try {
    const { amount, account, category } = req.body;
    const userId = req.session.userId;

    const accountName = normalizeAccount(account);
    if (!amount || !accountName || !category)
      return res.status(400).json({ message: "Missing parameters." });

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0)
      return res.status(400).json({ message: "Invalid deposit amount." });

    const userUpdate = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { [accountName]: depositAmount } }
    );
    if (userUpdate.modifiedCount === 0)
      return res.status(404).json({ message: "User not found." });

    const newTransfer = {
      UserID: new ObjectId(userId),
      AmountTransferred: depositAmount,
      AccountTransferedFrom: "EXTERNAL",
      AccountTransferedTo: `${accountName}_${userId}`,
      TransferCategory: category,
      TransferDate: new Date(),
      TransferType: "deposit",
    };
    await transferCollection.insertOne(newTransfer);

    res.status(200).json({ message: "Deposit successful." });
  } catch (err) {
    console.error("Deposit failed:", err);
    res.status(500).json({ message: "Unexpected error during deposit." });
  }
});

recordRoutes.route("/withdraw").post(async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "User not logged in." });
  try {
    const { amount, account, category } = req.body;
    const userId = req.session.userId;

    const accountName = normalizeAccount(account);
    if (!amount || !accountName || !category)
      return res.status(400).json({ message: "Missing parameters." });

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0)
      return res.status(400).json({ message: "Invalid withdrawal amount." });

    const userUpdate = await userCollection.updateOne(
      { _id: new ObjectId(userId), [accountName]: { $gte: withdrawAmount } },
      { $inc: { [accountName]: -withdrawAmount } }
    );
    if (userUpdate.modifiedCount === 0)
      return res.status(400).json({
        message: "Insufficient funds. Withdrawal cannot be completed.",
      });

    const newTransfer = {
      UserID: new ObjectId(userId),
      AmountTransferred: withdrawAmount,
      AccountTransferedFrom: `${accountName}_${userId}`,
      AccountTransferedTo: "EXTERNAL",
      TransferCategory: category,
      TransferDate: new Date(),
      TransferType: "withdrawal",
    };
    await transferCollection.insertOne(newTransfer);

    res.status(200).json({ message: "Withdrawal successful." });
  } catch (err) {
    console.error("Withdrawal failed:", err);
    res.status(500).json({ message: "Unexpected error during withdrawal." });
  }
});

recordRoutes.route("/InternalTransfer").post(async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "User not logged in." });
  try {
    const { amount, fromAccount, toAccount, category } = req.body;
    const userId = req.session.userId;

    const fromName = normalizeAccount(fromAccount);
    const toName = normalizeAccount(toAccount);
    if (!amount || !fromName || !toName || !category)
      return res.status(400).json({ message: "Missing parameters." });
    if (fromName === toName)
      return res
        .status(400)
        .json({ message: "Cannot transfer to the same account." });

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0)
      return res.status(400).json({ message: "Invalid transfer amount." });

    const userUpdate = await userCollection.updateOne(
      { _id: new ObjectId(userId), [fromName]: { $gte: transferAmount } },
      { $inc: { [fromName]: -transferAmount, [toName]: transferAmount } }
    );
    if (userUpdate.modifiedCount === 0)
      return res.status(400).json({ message: "Insufficient funds." });

    const newTransfer = {
      UserID: new ObjectId(userId),
      AmountTransferred: transferAmount,
      AccountTransferedFrom: `${fromName}_${userId}`,
      AccountTransferedTo: `${toName}_${userId}`,
      TransferCategory: category,
      TransferDate: new Date(),
      TransferType: "internal",
    };
    await transferCollection.insertOne(newTransfer);

    res.status(200).json({ message: "Internal Transfer successful." });
  } catch (err) {
    console.error("Transfer failed:", err);
    res.status(500).json({ message: "Unexpected error during transfer." });
  }
});

recordRoutes.route("/ExternalTransfer").post(async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "User not logged in." });
  try {
    const { amount, fromAccount, toAccount, targetUserId, category } = req.body;
    const senderId = req.session.userId;

    const fromName = normalizeAccount(fromAccount);
    const toName = normalizeAccount(toAccount);
    if (!amount || !fromName || !toName || !targetUserId || !category)
      return res.status(400).json({ message: "Missing Paramaters." });

    const cleanTargetId = String(targetUserId).trim();
    if (!ObjectId.isValid(cleanTargetId))
      return res.status(400).json({ message: "Invalid User ID Format" });
    if (senderId.toString() === cleanTargetId)
      return res.status(400).json({
        message: "Cannot transfer to yourself. Use Internal Transfer.",
      });

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0)
      return res.status(400).json({ message: "Invalid transfer amount." });

    const targetObjId = new ObjectId(cleanTargetId);
    const targetUser = await userCollection.findOne({ _id: targetObjId });
    if (!targetUser)
      return res.status(400).json({ message: "Target User does not exist!" });

    const senderUpdate = await userCollection.updateOne(
      { _id: new ObjectId(senderId), [fromName]: { $gte: transferAmount } },
      { $inc: { [fromName]: -transferAmount } }
    );
    if (senderUpdate.modifiedCount === 0)
      return res.status(400).json({ message: "Insufficient funds." });

    await userCollection.updateOne(
      { _id: targetObjId },
      { $inc: { [toName]: transferAmount } }
    );

    const newTransfer = {
      UserID: new ObjectId(senderId),
      AmountTransferred: transferAmount,
      AccountTransferedFrom: `${fromName}_${senderId}`,
      AccountTransferedTo: `${toName}_${cleanTargetId}`,
      TransferCategory: category,
      TransferDate: new Date(),
      TransferType: "external",
    };
    await transferCollection.insertOne(newTransfer);

    res.status(200).json({ message: "External Transfer successful." });
  } catch (err) {
    console.error("External Transfer failed:", err);
    res.status(500).json({ message: "Unexpected error during transfer." });
  }
});

recordRoutes.route("/TransfersFor").post(async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "User not logged in." });
  try {
    const { account } = req.body;
    const userId = req.session.userId.toString();

    const accountName = normalizeAccount(account);
    if (!accountName)
      return res.status(400).json({
        message:
          "Please enter a valid account (1,2,3 or checking/savings/other).",
      });

    const accountID = `${accountName}_${userId}`;

    const results = await transferCollection
      .find({
        $or: [
          { AccountTransferedFrom: accountID },
          { AccountTransferedTo: accountID },
        ],
      })
      .sort({ TransferDate: -1, transferDate: -1 })
      .toArray();

    res.json(results);
  } catch (err) {
    console.error("Fetching account history failed:", err);
    res.status(500).json({ message: "Unexpected error occurred." });
  }
});

recordRoutes.route("/me").get(async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "User not logged in." });
  try {
    const user = await userCollection.findOne(
      { _id: new ObjectId(req.session.userId) },
      { projection: { username: 1, checking: 1, savings: 1, other: 1 } }
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    console.error("Fetch /me failed:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

recordRoutes.route("/logout").get(async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error during logout." });
  }
});

recordRoutes.route("/CategorySummary").get(async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "User not logged in." });
  try {
    const userId = new ObjectId(req.session.userId);

    const categorySummaryFind = await transferCollection.aggregate([
      { $match: { UserID: userId } },
      {
        $group: {
          _id: "$TransferCategory",
          totalAmount: { $sum: "$AmountTransferred" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const categorySummary = await categorySummaryFind.toArray();
    res.status(200).json(categorySummary);
  } catch (err) {
    console.error("Fetching Category Summary failed:", err);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

module.exports = recordRoutes;
