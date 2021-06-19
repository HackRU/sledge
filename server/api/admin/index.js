const router = require('express').Router();
const categoryRouter = require('./categories');
const judgesRouter = require('./judges');
const hackathonsRouter = require('./hackathons');

router.use('/categories', categoryRouter);
router.use('/judges', judgesRouter);
router.use('/hackathons', hackathonsRouter);

module.exports = router;
