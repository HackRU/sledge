const router = require('express').Router();
const {
  getSubmissions,
  getSampleSubmission,
  getSubmissionByID,
  createSubmission,
  updateSubmission,
  convertCSVtoJSON,
} = require('../controllers/submission.controller.js');

/**
 * @swagger
 * /api/submissions:
 *  get:
 *    summary: Retrieve a list of all of the submissions
 *    produces:
 *       - application/json
 *    tags:
 *      - submissions
 */
router.get('/', getSubmissions);

/**
 * @swagger
 * /api/submissions/getSample:
 *  get:
 *    summary: Retrieve a list of all of Sample submissions
 *    produces:
 *       - application/json
 *    tags:
 *      - submissions
 */
router.get('/getSample', getSampleSubmission);

/**
 * @swagger
 * /api/submissions/{submissionID}:
 *   get:
 *     summary: Retrieves the specified submission from the specified team
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: submissionID
 *         required: true
 *         type: string
 *         description: The submission ID
 *     tags:
 *       - submissions
 */
router.get('/:submissionID', getSubmissionByID);

/**
 * @swagger
 * /api/submissions/:
 *   post:
 *     summary: Creates a new submission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             #ref: '#/api/models/submission
 *     responses:
 *       200:
 *       produces:
 *         - application/json
 *     tags:
 *       - submissions
 */
router.post('/', createSubmission);

// update a submission with new info
router.patch('/:submissionID', updateSubmission);

router.post('/CSVpost', convertCSVtoJSON);

module.exports = router;
