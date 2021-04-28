const express = require('express');
var cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// documentation setup on base route
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerDefinition = require('./swagger.json');

const options = {
  definition: swaggerDefinition,
  apis: ['./api/*.js', './models/*.js'],
};
const specs = swaggerJsDoc(options);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs, { explorer: true }));

const apiRouter = require('./api');
app.use('/api', apiRouter);

app.post('/login', (req, res) => {
  res.send('No logging in system in place here yet :\\');
  // 1. get hacker's teamID from LCS
  // 2. log them in
  // 3. ???
  // 4. profit
});

module.exports = app;
