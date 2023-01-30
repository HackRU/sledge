const Submission = require('../../models/submission.model');

/*
 * Retrieves all submissions from the database.
 */
const findSubmissions = async () => {
  const submissions = await await Submission.find({});
  return submissions;
};

/*
 * Retrieves the submission with the necessary ID from the database.
 */
const findSubmissionById = async (id) => {
  const submission = await Submission.findById(id); // parameter is req.params.submissionID
  return submission;
};

/*
 * Posts a new submission to the database.
 */
const postSubmission = async (req) => {
  const newSubmission = await Submission.create({
    urls: req.body.urls,
    attributes: {
      description: req.body.description,
      technologies: req.body.technologies,
      title: req.body.title,
    },

    // categories: req.body.categories,
    // there is no teamId, state, categories, flags,
    // provided in the form. also, no way to handle
    // images atm.
  });
  return newSubmission;
};

/*
 * Updates a submission in the database.
 */
const patchSubmission = async (req) => {
  const updatedSubmission = await Submission.findOneAndUpdate(
    req.params.submissionID,
    req.body,
    {
      new: true,
    },
  );
  return updatedSubmission;
};

module.exports = {
  findSubmissions,
  findSubmissionById,
  postSubmission,
  patchSubmission,
};
