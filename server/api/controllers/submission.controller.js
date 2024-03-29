const formidable = require('formidable');
const {
  findSubmissions,
  findSubmissionById,
  postSubmission,
  patchSubmission,
} = require('../services/submission.service.js');
const { convertCSV } = require('../helpers/convertCSV');
const { generateSubmission } = require('../../testing/testObjectGenerator.js');

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
    res.status(500).send('Submission not found.');
  }
};

const getSampleSubmission = async (req, res) => {
  const foundUsers = await generateSubmission();
  if (foundUsers) {
    res.status(200).send(foundUsers);
  } else {
    res.status(500).send('Submission list not generated.');
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
  const form = formidable({ multiples: true });
  let filepath;

  console.log(req.body);

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));
      return;
    }

    console.log(files);

    filepath = files.file.filepath;
    const JSONSubmissions = await convertCSV(filepath);
    if (JSONSubmissions) {
      res.send(JSON.stringify(JSONSubmissions));
    } else {
      res.status(500).send('Submissions converting not done correctly');
    }
  });
};

module.exports = {
  getSubmissions,
  getSubmissionByID,
  getSampleSubmission,
  createSubmission,
  updateSubmission,
  convertCSVtoJSON,
};
