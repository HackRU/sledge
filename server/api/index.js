const router = require('express').Router();

// documentation setup and routing
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerDefinition = require('../swagger.json');

const options = {
  definition: swaggerDefinition,
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
