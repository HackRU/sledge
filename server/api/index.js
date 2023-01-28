const router = require('express').Router();

// endpoint routing
const adminRouter = require('./admin');
const submissionsRouter = require('../router/submission.route');

router.use('/admin', adminRouter);
router.use('/submissions', submissionsRouter);

module.exports = router;
