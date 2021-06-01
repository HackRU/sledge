const router = require('express').Router();
const Hackathon = require('../../models/hackathonSchema.model');

router.post('/', (req, res) => {});

router.patch('/:hackathonId', (req, res) => {});

router.get('/', (req, res) => {});

router.get('/current', (req, res) => {});

router.get('/:hackathonId', (req, res) => {});

router.get('/:hackathonId/phase', (req, res) => {});

module.exports = router;
