const express = require("express");
const mongoose = require("mongoose");
const config = require("./config.json");

const app = express();
app.use(express.json());
const port = 5000;

var submission = require("./models/submissionSchema.model");

const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`; // Connection URL, set it in config.json

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

// returns all submissions
app.get("/api/submissions", (req, res) => {
  res.status(200).send(submission.find({}));
});

// return submission data
app.get("/api/submissions/:teamID", (req, res) => {
  res.status(200).send(submission.findById(req.params.teamID));
});

// add/update submission
app.post("/api/submissions/:teamID", (req, res) => {
  submission.findByIdAndUpdate(req.params.teamID, req.body);
  res.status(200);
});

app.post("/login", (req, res) => {
  // 1. get hacker's teamID from LCS
  // 2. log them in
  // 3. ???
  // 4. profit
});

app.listen(port, () => console.log(`Server running on port ${port}`));
