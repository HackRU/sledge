const express = require("express");

const app = express();
app.use(express.json());

const submissionsRouter = require("./routes/submissions");
const adminRouter = require("./routes/admin");

app.use("/api/submissions", submissionsRouter);
app.use("/api/admin", adminRouter);

app.post("/login", (req, res) => {
  // 1. get hacker's teamID from LCS
  // 2. log them in
  // 3. ???
  // 4. profit
});

module.exports = app;
