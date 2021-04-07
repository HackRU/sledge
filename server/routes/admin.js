const router = require("express").Router();
const categoryRouter = require("./admin/category");
const judgesRouter = require("./admin/judges");

router.use("/category", categoryRouter);
router.use("/judges", judgesRouter);

module.exports = router;
