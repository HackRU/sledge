const {
  findSubmissions,
  findSubmissionById,
  postSubmission,
  patchSubmission,
} = require('../services/submission.service.js');
const { convertCSV } = require('../helpers/convertCSV');

const getSubmissions = async (req, res) => {
  const foundUsers = await findSubmissions();
  if (foundUsers) {
    res.status(200).send(foundUsers);
  } else {
    res.status(500).send('Submission list not generated.');
  }
};

const getSubmissionByID = async (req, res) => {
  const foundUser = await findSubmissionById(req.params.id);
  if (foundUser) {
    res.status(200).send(foundUser);
  } else {
    res.status(500).send('Submissoin not found.');
  }
};

const createSubmission = async (req, res) => {
  const newSub = await postSubmission(req);
  if (newSub) {
    res.status(200).json({
      message: 'success',
      id: newSub.id,
    });
  } else {
    res.status(500).send('Submission not created.');
  }
};

const updateSubmission = async (req, res) => {
  const updatedSub = await patchSubmission(req);
  if (updatedSub) {
    res.status(200).send(updatedSub.id);
  } else {
    res.status(500).send('Submisison updating not done correctly');
  }
};

const convertCSVtoJSON = async (req, res) => {
  const JSONSubmissions = await convertCSV();
  if (JSONSubmissions) {
    res.status(200).json({
      message: 'Successfully converted submissions',
      submissions: JSONSubmissions,
    });
  } else {
    res.status(500).send('Submissions converting not done correctly');
  }
};

module.exports = {
  getSubmissions,
  getSubmissionByID,
  createSubmission,
  updateSubmission,
  convertCSVtoJSON,
};
