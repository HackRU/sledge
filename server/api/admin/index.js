const router = require('express').Router();
const categoryRouter = require('./categories');
const judgesRouter = require('./judges');

<<<<<<< HEAD
router.use("/categories", categoryRouter);
router.use("/judges", judgesRouter);
=======
router.use('/category', categoryRouter);
router.use('/judges', judgesRouter);
>>>>>>> 31bfa3e892fb2b0f087457e7e39da7bd466e6d14

module.exports = router;
