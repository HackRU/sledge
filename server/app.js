const express = require("express");

const app = express();
app.use(express.json());

const Submission = require("./models/submissionSchema.model");

// returns all submissions
app.get("/api/submissions", (req, res) => {
  res.status(200).send(Submission.find({}));
});

// return submission data
app.get("/api/submissions/:teamID", (req, res) => {
  res.status(200).send(Submission.findById(req.params.teamID));
});

// create new submission
app.post("/api/submissions/:teamID/create", (req, res) => {
  const currentSubmission = new Submission(req.body);
  currentSubmission.save((err, submission) => {
    if (err) res.status(500).send(err);
    res.status(200).send(submission);
  });
});

app.post("/login", (req, res) => {
  // 1. get hacker's teamID from LCS
  // 2. log them in
  // 3. ???
  // 4. profit
});

module.exports = app;