const {
  findSubmissions,
  findSubmissionById,
  postSubmission,
  patchSubmission,
} = require('../services/submission.service.js');
const { convertCSV } = require('../helpers/convertCSV');
const { generateSubmission } = require('../../testing/testObjectGenerator.js');
const formidable = require('formidable');


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
  const form = formidable({multiples: true});

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      res.end(String(err));
      return;
    }
    //TODO: parse csv file to convertCSV 
    //TODO: return submission model to res
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ fields, files }, null, 2));
  });

  //const JSONSubmissions = await convertCSV();
  // if (JSONSubmissions) {
  //   res.status(200).json({
  //     message: 'Successfully converted submissions',
  //     submissions: JSONSubmissions,
  //   });
  // } else {
  //   res.status(500).send('Submissions converting not done correctly');
  // }
};

module.exports = {
  getSubmissions,
  getSubmissionByID,
  getSampleSubmission,
  createSubmission,
  updateSubmission,
  convertCSVtoJSON,
};
