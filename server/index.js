const express = require('express');
var cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const apiRouter = require('./api');

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Welcome to Sledge!');
});

app.post('/login', (req, res) => {
  // 1. get hacker's teamID from LCS
  // 2. log them in
  // 3. ???
  // 4. profit
});

module.exports = app;
