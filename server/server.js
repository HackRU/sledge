const express = require("express");
const mongoose = require("mongoose");
const config = require("./config.json")

const app = express();
const port = 5000;

var submission = require("./models/submissionSchema.model");

const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`; // Connection URL, set it in config.json

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;

app.get("/api/submissions/:teamID", (req, res) => {
  // return submission data
})

app.listen(port, () => console.log(`Server running on port ${port}`));