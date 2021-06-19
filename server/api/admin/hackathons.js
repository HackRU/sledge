const router = require('express').Router();
const Hackathon = require('../../models/hackathon.model');

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

router.get('/', async (req, res) => {
  res.status(200).send(await Hackathon.find({}));
});

router.get('/current', async (req, res) => {
  res.status(200).send(await Hackathon.findOne({ isComplete: false }));
});

router.get('/:hackathonId', async (req, res) => {
  res.status(200).send(await Hackathon.findById(req.params.hackathonId));
});

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
