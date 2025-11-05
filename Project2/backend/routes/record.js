const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
const crypto = require("crypto");

const db = dbo.getDB();

const userCollection = db.collection("Users");
const transferCollection = db.collection("Transfers");

const isValidAccount = (accountName) => {
  return ["checking", "savings", "other"].includes(accountName);
};

/*
Users Stores
Username
Password
Salt
Hash
1
2
3

Transfers Stores
UserId
AmountTransferred
AccountTransferedFrom NULL unless transfer was external
AccountTransferedToWith NULL unless transfer was external
TransferCategory
TransferDate
TransferType


ROUTES NEEDED:
Register New User
Log in User
Transfer Within User Account
Transfer With Another User's Account (Requires User ID number and Account Number)
Transfer History List
Deposit Money
Withdraw Money --Error check: MONEY CANNOT GO BELOW 0
Transfer History for Specific Account ID for User ID
Transfer History for all Accounts of User ID

Store Account IDs as 1, 2, 3
1- Checking
2- Savings
3- Other


Add Logout Route
Add Graph Route
*/

function genSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password, salt) {
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

//placeholder: Get all user data
recordRoutes.route("/getUsers").get(async (req, res) => {
  try {
    const results = await userCollection.find({}).toArray();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

recordRoutes.route("/getTransfers").get(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "User not logged in." });
  }
  try {
    const userIdString = req.session.userId.toString();
    const userCheck = new RegExp(`_${userIdString}`);

    let myquery = {
      $or: [
        { AccountTransferedFrom: userCheck },
        { AccountTransferedTo: userCheck },
      ],
    };
    const results = await transferCollection
      .find(myquery)
      .sort({ transferDate: -1 })
      .toArray();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching transfers.");
  }
});

recordRoutes.route("/register").post(async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const currentUser = await userCollection.findOne({ username: username });
    if (!username || !password) {
      return res.status(400).json({ message: "Missing Registration fields!" });
    }
    if (currentUser) {
      return res.status(409).json({ message: "Username already taken." });
    }
    const salt = genSalt();
    const hashedPassword = hashPassword(password, salt);

    let newUser = {
      username: username,
      salt: salt,
      hashedPassword: hashedPassword,
      checking: 0,
      savings: 0,
      other: 0,
    };

    const result = await userCollection.insertOne(newUser);

    req.session.username = newUser.username;
    req.session.userId = result.insertedId;
    res
      .status(201)
      .json({ message: "Registration Successful. Please Log in." });
  } catch (err) {
    console.error("Registration failed:", err);
    return res
      .status(500)
      .json({ message: "An unexpected error occured during registration." });
  }
});

recordRoutes.route("/login").post(async (req, res) => {
  //allow user to Log IN
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await userCollection.findOne({ username: username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const testHash = hashPassword(password, user.salt);

    if (user.hashedPassword === testHash) {
      req.session.username = user.username;
      req.session.userId = user._id;
      res.status(200).json({ message: "Log in Successful." });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error("Log in failed:", err);
    return res
      .status(500)
      .json({ message: "An unexpected error occured during log in." });
  }
});

recordRoutes.route("/deposit").post(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "User not logged in." });
  }
  try {
    const { amount, account, category } = req.body;
    const userId = req.session.userId;

    if (!amount || !account || !category) {
      return res
        .status(400)
        .json({ message: "Missing Paramaters. Please fill all fields." });
    }
    if (!isValidAccount(account)) {
      return res.status(400).json({ message: "Invalid Account." });
    }
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount." });
    }

    const userUpdate = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { [account]: depositAmount } }
    );

    if (userUpdate.modifiedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const newTransfer = {
      UserID: new ObjectId(userId),
      AmountTransferred: depositAmount,
      AccountTransferedFrom: "EXTERNAL", //External Means Cash Deposit
      AccountTransferedTo: `${account}_${userId}`,
      TransferCategory: category,
      TransferDate: new Date(),
      TransferType: "deposit",
    };
    await transferCollection.insertOne(newTransfer);

    res.status(200).json({ message: "Deposit successful." });
  } catch (err) {
    console.error("Deposit failed:", err);
    return res
      .status(500)
      .json({ message: "An unexpected error ocurred during deposit." });
  }
});

recordRoutes.route("/withdraw").post(async (req, res) => {
  //allow user to withdraw money into chosen account
  if (!req.session.userId) {
    return res.status(401).json({ message: "User not logged in." });
  }
  try {
    const { amount, account, category } = req.body;
    const userId = req.session.userId;

    if (!amount || !account || !category) {
      return res
        .status(400)
        .json({ message: "Missing Paramaters. Please fill all fields." });
    }
    if (!isValidAccount(account)) {
      return res.status(400).json({ message: "Invalid Account." });
    }
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawl amount." });
    }

    const userUpdate = await userCollection.updateOne(
      {
        _id: new ObjectId(userId),
        [account]: { $gte: withdrawAmount },
      },
      { $inc: { [account]: -withdrawAmount } }
    );

    if (userUpdate.modifiedCount === 0) {
      return res.status(400).json({
        message: "Insufficient funds. Withdrawl cannot be completed.",
      });
    }

    const newTransfer = {
      UserID: new ObjectId(userId),
      AmountTransferred: withdrawAmount,
      AccountTransferedFrom: `${account}_${userId}`,
      AccountTransferedTo: "EXTERNAL",
      TransferCategory: category,
      TransferDate: new Date(),
      TransferType: "withdrawal",
    };

    await transferCollection.insertOne(newTransfer);

    res.status(200).json({ message: "Withdrawl successful." });
  } catch (err) {
    console.error("Withdrawal failed:", err);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during withdrawal." });
  }
});

recordRoutes.route("/InternalTransfer").post(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "User not logged in." });
  }
  try {
    const { amount, fromAccount, toAccount, category } = req.body;
    const userId = req.session.userId;

    if (!amount || !fromAccount || !toAccount || !category) {
      return res.status(400).json({ message: "Missing paramaters." });
    }
    if (!isValidAccount(fromAccount) || !isValidAccount(toAccount)) {
      return res.status(400).json({ message: "Invalid account name." });
    }
    if (fromAccount === toAccount) {
      return res
        .status(400)
        .json({ message: "Cannot transfer to the same account." });
    }
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ message: "Invalid transfer amount." });
    }

    const userUpdate = await userCollection.updateOne(
      {
        _id: new ObjectId(userId),
        [fromAccount]: { $gte: transferAmount },
      },
      {
        $inc: {
          [fromAccount]: -transferAmount,
          [toAccount]: transferAmount,
        },
      }
    );
    if (userUpdate.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: "Insufficient funds in source account." });
    }

    const newTransfer = {
      UserID: new ObjectId(userId),
      AmountTransferred: transferAmount,
      AccountTransferedFrom: `${fromAccount}_${userId}`,
      AccountTransferedTo: `${toAccount}_${userId}`,
      TransferCategory: category,
      transferDate: Date(),
      TransferType: "internal",
    };

    await transferCollection.insertOne(newTransfer);

    res.status(200).json({ message: "Internal Transfer successful." });
  } catch (err) {
    console.error("Transfer failed:", err);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during transfer." });
  }
});

recordRoutes.route("/ExternalTransfer").post(async (req, res) => {
  //allow user to transfer with another account, as long as you have given id and 1,2,3 for account to transfer with
  if (!req.session.userId) {
    return res.status(401).json({ message: "User not logged in." });
  }
  try {
    const { amount, fromAccount, toAccount, targetUserId, category } = req.body;
    const senderId = req.session.userId;

    if (!amount || !fromAccount || !toAccount || !targetUserId || !category) {
      return res.status(400).json({ message: "Missing Paramaters." });
    }
    if (!isValidAccount(fromAccount) || !isValidAccount(toAccount)) {
      return res.status(400).json({ message: "Invalid account name." });
    }
    if (senderId.toString() === targetUserId) {
      return res.status(400).json({
        message: "Cannot transfer to yourself. Use Internal Transfer.",
      });
    }
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ message: "Invalid transfer amount." });
    }

    let targetUser;
    try {
      targetUser = await userCollection.findOne({
        _id: new ObjectId(targetUserId),
      });
    } catch (e) {
      return res.status(400).json({ message: "Invalid User ID Format" });
    }
    if (!targetUser) {
      return res.status(400).json({ message: "Target User does not exist!" });
    }

    const senderUpdate = await userCollection.updateOne(
      {
        _id: new ObjectId(senderId),
        [fromAccount]: { $gte: transferAmount },
      },
      {
        $inc: { [fromAccount]: -transferAmount },
      }
    );

    if (senderUpdate.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: "Insufficient funds in your account." });
    }

    await userCollection.updateOne(
      { _id: new ObjectId(targetUserId) },
      { $inc: { [toAccount]: transferAmount } }
    );

    const newTransfer = {
      UserID: new ObjectId(senderId),
      AmountTransferred: transferAmount,
      AccountTransferedFrom: `${fromAccount}_${senderId}`,
      AccountTransferedTo: `${toAccount}_${targetUserId}`,
      TransferCategory: category,
      transferDate: Date(),
      TransferType: "external",
    };

    await transferCollection.insertOne(newTransfer);

    res.status(200).json({ message: "External Transfer successful." });
  } catch (err) {
    console.error("External Transfer failed:", err);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred during transfer." });
  }
});

recordRoutes.route("/TransfersFor").post(async (req, res) => {
  //grab the specific history of one account transfers
  if (!req.session.userId) {
    return res.status(401).json({ message: "User not logged in." });
  }
  try {
    const { account } = req.body;
    const userId = req.session.userId.toString();

    if (!account) {
      return res.status(400).json({ message: "Please enter an account." });
    }
    if (!isValidAccount(account)) {
      return res
        .status(400)
        .json({ messgae: "Please enter a valid account name." });
    }

    const accountID = `${account}_${userId}`;

    const results = await transferCollection
      .find({
        $or: [
          { AccountTransferedFrom: accountID },
          { AccountTransferedTo: accountID },
        ],
      })
      .sort({ TransferDate: -1 })
      .toArray();

    res.json(results);
  } catch (err) {
    console.error("Fetching account history failed:", err);
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
});
// Current user info (balances + username)
//JM
recordRoutes.route("/me").get(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "User not logged in." });
  }
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
    res.status(200).json({ message: "Logged out sucessfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error during logout." });
  }
});

recordRoutes.route("/CategorySummary").get(async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "User not logged in." });
  }
  try {
    const userId = new ObjectId(req.session.userId);
    console.log(`userID is ${userId}`);

    const categorySummaryFind = await transferCollection.aggregate([
      {
        $match: {
          UserID: userId,
        },
      },
      {
        $group: {
          _id: "$TransferCategory",
          totalAmount: {
            $sum: "$AmountTransferred",
          },
        },
      },
      {
        $sort: {
          totalAmount: -1,
        },
      },
    ]);

    const categorySummary = await categorySummaryFind.toArray();
    console.log(categorySummary);
    return res.status(200).json(categorySummary);
  } catch (err) {
    console.error("Fetching Category Summary failed:", err);
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
});

module.exports = recordRoutes;
