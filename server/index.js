const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// documentation setup on base route
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerDefinition = require('./swagger.json');

const options = {
  definition: swaggerDefinition,
  apis: ['./api/**/*.js', './models/**/*.js'],
};
const specs = swaggerJsDoc(options);

app.use('/', swaggerUI.serve);
app.get('/', swaggerUI.setup(specs, { explorer: true }));

const apiRouter = require('./api');

app.use('/api', apiRouter);

module.exports = app;
