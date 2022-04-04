const router = require('express').Router();
const Hackathon = require('../../models/hackathon.model');

/**
 * @swagger
 * /api/admin/hackathons:
 *  post:
 *    summary: Create a new hackathon
 *    produces:
 *       - application/json
 *    tags:
 *      - hackathons
 */

router.post('/', async (req, res) => {
  const n = await Hackathon.findOne({ isComplete: false });
  if (n != null) {
    res.status(500).json({
      message: 'Hackathon already running',
    });
  } else {
    await Hackathon.create({}, (err, hackathon) => {
      if (err) res.status(500).send(err);
      res.status(200).json({
        message: 'success',
        id: hackathon.id,
      });
    });
  }
});

/**
 * @swagger
 * /api/admin/hackathons/{hackathonId}:
 *  patch:
 *    summary: Update an existing hackathon by hackathonId
 *    produces:
 *       - application/json
 *    tags:
 *      - hackathons
 */

router.patch('/:hackathonId', async (req, res) => {
  res
    .status(200)
    .send(await Hackathon.findByIdAndUpdate(req.params.hackathonId, req.body));
});

/**
 * @swagger
 * /api/admin/hackathons:
 *  get:
 *    summary: Retrieve a list of all of the hackathons
 *    produces:
 *       - application/json
 *    tags:
 *      - hackathons
 */
router.get('/', async (req, res) => {
  res.status(200).send(await Hackathon.find({}));
});

/**
 * @swagger
 * /api/admin/hackathons/current:
 *  get:
 *    summary: Retrieve a list of all of the current hackathons
 *    produces:
 *       - application/json
 *    tags:
 *      - hackathons
 */

router.get('/current', async (req, res) => {
  res.status(200).send(await Hackathon.findOne({ isComplete: false }));
});

/**
 * @swagger
 * /api/admin/hackathons/{hackathonId}:
 *  get:
 *    summary: Retrieve hackathon information based on hackathonId
 *    produces:
 *       - application/json
 *    parameters:
 *       - in: path
 *         name: hackathonId
 *         required: true
 *         type: string
 *         description: The hackathon Id
 *    tags:
 *      - hackathons
 */
router.get('/:hackathonId', async (req, res) => {
  res.status(200).send(await Hackathon.findById(req.params.hackathonId));
});

/**
 * @swagger
 * /api/admin/hackathons/{hackathonId}/phase:
 *  get:
 *    summary: Retrieve phase information of hackathon based on hackathonId
 *    produces:
 *       - application/json
 *    parameters:
 *       - in: path
 *         name: hackathonId
 *         required: true
 *         type: string
 *         description: The hackathon Id
 *    tags:
 *      - hackathons
 */
router.get('/:hackathonId/phase', async (req, res) => {
  const selectedHackathon = await Hackathon.findById(req.params.hackathonId);
  if (selectedHackathon.submissionPhase.inProgress) {
    res.status(200).json({ message: 'submissions' });
  } else if (selectedHackathon.judgingPhase.inProgress) {
    res.status(200).json({ message: 'judging' });
  } else if (selectedHackathon.isComplete) {
    res.status(200).json({ message: 'post-hackathon' });
  } else {
    res.status(200).json({ message: 'pre-hackathon' });
  }
});

module.exports = router;
