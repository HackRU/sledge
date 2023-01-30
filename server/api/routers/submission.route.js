const router = require('express').Router();
const {
  getSubmissions,
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
 * /api/submissions/{teamID}/{submissionID}:
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
 * /api/submissions/{teamID}/create:
 *   post:
 *     summary: Creates a new submission
 *     responses:
 *       200:
 *       produces:
 *         - application/json
 *     parameters:
 *       - in: path
 *         name: teamID
 *         required: true
 *         type: string
 *         description: The team ID
 *       - in: path
 *         name: submissionID
 *         required: true
 *         type: string
 *         description: The submission ID
 *     tags:
 *       - submissions
 */
router.post('/', createSubmission);

// update a submission with new info
router.patch('/:submissionID', updateSubmission);

router.post('/CSVpost', convertCSVtoJSON);

module.exports = router;
