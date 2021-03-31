const express = require("express");

const app = express();
app.use(express.json());

const submissionsRouter = require("./routes/submissions");

app.use("/api/submissions", submissionsRouter);

app.post("/login", (req, res) => {
  // 1. get hacker's teamID from LCS
  // 2. log them in
  // 3. ???
  // 4. profit
});

module.exports = app;
