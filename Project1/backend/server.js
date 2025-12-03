const express = require("express");
const cors = require("cors");
const stockRoutes = require("./routes/routes");
const app = express();
const port = 4000;

app.use(
  cors({
    origin: "http://localhost:5000",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

app.use('/', stockRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
