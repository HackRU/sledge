const router = require('express').Router();
const categoryRouter = require('./categories');
const judgesRouter = require('./judges');

router.use("/categories", categoryRouter);
router.use("/judges", judgesRouter);

module.exports = router;
