const router = require('express').Router();

// documentation setup and routing
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sledge',
      version: '0.1.0',
      description: "HackRU's Sledge API",
      contact: {
        name: 'HackRU',
        url: 'https://hackru.org',
      },
    },
    servers: [
      {
        url: 'localhost:5000',
      },
      {
        url: 'http://sledge.hackru.org/dev/',
      },
    ],
  },
  apis: ['./api/*.js', './models/*.js'],
};

const specs = swaggerJsDoc(options);

router.use(
  '/docs',
  swaggerUI.serve,
  swaggerUI.setup(specs, { explorer: true })
);

// endpoint routing
const adminRouter = require('./admin');
const submissionsRouter = require('./submissions');

router.use('/admin', adminRouter);
router.use('/submissions', submissionsRouter);

module.exports = router;
