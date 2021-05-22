const router = require('express').Router();
const Submission = require('../models/submissionSchema.model');

/**
 * @swagger
 * /api/submissions:
 *  get:
 *    summary: Retrieve a list of all of the submissions
 */
router.get('/', async ({ res }) => {
  res.status(200).send(await Submission.find({}));
});

/**
 * @swagger
 * /api/submissions/{teamID}/{submissionID}:
 *   get:
 *     summary: Retrieves the specified submission from the specified team
 *     produces:
 *       - application/json
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
 */
router.get('/:teamID/:submissionID', async (req, res) => {
  await Submission.findById(req.params.submissionID, (err, submission) => {
    if (err) res.status(500).send(err);
    res.status(200).send(submission);
  });
});

// create new submission
router.post('/:teamID/create', (req, res) => {
  // const newSubmission = new Submission();
  Submission.create({}, (err, submission) => {
    if (err) res.status(500).send(err);
    res.status(200).json({
      message: 'success',
      id: submission.id,
    });
  });

  // newSubmission.save((err, submission) => {
  //   if (err) res.status(500).send(err);
  //   res.status(200).json({
  //     message: 'success',
  //     _id: submission.id,
  //   });
  // });
});

// update a submission with new info
router.patch('/:teamID/:submissionID/save', async (req, res) => {
  await Submission.findOneAndUpdate(req.params.submissionID, req.body, {
    new: true,
    upsert: true,
  });

  res.status(200).send(await Submission.findById(req.params.submissionID));
});

module.exports = router;
