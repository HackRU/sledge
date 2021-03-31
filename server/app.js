const express = require("express");
const { update } = require("./models/submissionSchema.model");

const app = express();
app.use(express.json());

const Submission = require("./models/submissionSchema.model");

// returns all submissions
app.get("/api/submissions", async (req, res) => {
  res.status(200).send(await Submission.find({}));
});

// return submission data
app.get("/api/submissions/:teamID/:submissionID", async (req, res) => {
  await Submission.findById(req.params.submissionID, (err, submission) => {
    if (err) res.status(500).send(err);
    res.status(200).send(submission);
  });
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

// Update isSubmitted to true
app.patch("/api/submissions/:teamID/:submissionID/submit", async (req, res) => {
  await Submission.findByIdAndUpdate(req.params.submissionID, {isSubmitted: true});
  res.status(200).send(await Submission.findById(req.params.submissionID));
});

// Update isSubmitted to false
app.patch("/api/submissions/:teamID/:submissionID/unsubmit", async (req, res) => {
  await Submission.findByIdAndUpdate(req.params.submissionID, {isSubmitted: false});
  res.status(200).send(await Submission.findById(req.params.submissionID));
});


module.exports = app;
