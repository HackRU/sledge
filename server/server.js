const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 5000;

var submission = require("./models/submissionSchema.model");

// Connection URL
const url = "mongodb://localhost:27017";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

app.get("/api/submissions/:teamID", (req, res) => {
  // return submission data
})

app.listen(port, () => console.log(`Server running on port ${port}`));