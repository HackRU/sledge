const router = require('express').Router();
const Hackathon = require('../../models/hackathonSchema.model');

/**
 * @swagger
 */
router.post('/', async (req, res) => {
  Hackathon.create({}, (err, hackathon) => {
    if (err) res.status(500).send(err);
    res.status(200).json({
      message: 'success',
      id: hackathon.id,
    });
  });
});

/**
 * @swagger
 */
router.patch('/:hackathonId', async (req, res) => {
  const hackathonToUpdate = await Hackathon.findById(req.params.hackathonId);
  if ('season' in req.body) {
    hackathonToUpdate.season = req.body.season;
  }

  if ('categories' in req.body) {
    hackathonToUpdate.categories = req.body.categories;
  }

  if ('submissionPhase' in req.body) {
    if ('inProgress' in req.body.submissionPhase) {
      hackathonToUpdate.submissionPhase.inProgress =
        req.body.submissionPhase.inProgress;
    }
    if ('deadline' in req.body.submissionPhase) {
      hackathonToUpdate.submissionPhase.deadline =
        req.body.submissionPhase.deadline;
    }
    if ('flags' in req.body.submissionPhase) {
      hackathonToUpdate.submissionPhase.flags = req.body.submissionPhase.flags;
    }
  }

  if ('judgingPhase' in req.body) {
    if ('inProgress' in req.body.judgingPhase) {
      hackathonToUpdate.judgingPhase.inProgress =
        req.body.judgingPhase.inProgress;
    }
  }

  if ('isComplete' in req.body) {
    hackathonToUpdate.isComplete = req.body.isComplete;
  }

  hackathonToUpdate.save();
  res.status(200).json({
    message: 'success',
    id: req.params.hackathonId,
  });
});

/**
 * @swagger
 */
router.get('/', async (req, res) => {
  res.status(200).send(await Hackathon.find({}));
});

/**
 * @swagger
 */
router.get('/current', async (req, res) => {
  res.status(200).send(await Hackathon.findOne({ isComplete: false }));
});

/**
 * @swagger
 */
router.get('/:hackathonId', async (req, res) => {
  res.status(200).send(await Hackathon.findById(req.params.hackathonId));
});

/**
 * @swagger
 */
router.get('/:hackathonId/phase', async (req, res) => {
  const selectedHackathon = await Hackathon.findById(req.params.hackathonId);
  if (!selectedHackathon.submissionPhase.isComplete) {
    res.status(200).send('submission');
  } else if (!selectedHackathon.judgingPhase.isComplete) {
    res.status(200).send('judging');
  } else if (!selectedHackathon.isComplete) {
    res.status(200).send('completed');
  } else {
    res.status(200).send('not started');
  }
});

module.exports = router;
