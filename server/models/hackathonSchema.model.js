const mongoose = require('mongoose');

const { Schema } = mongoose;

const hackathonSchema = new Schema({
  season: String, // ex. Spring 2021
  categories: [mongoose.Types.ObjectId], // _id refers to a Category.
  submissionPhase: {
    inProgress: Boolean, // is submissions phase in progress.
    deadline: Date, // automatically set inProgress to false when deadline is reached. Optional.
    flags: [mongoose.Types.ObjectId], // array of submissions. _id refers to a Submission.
  },
  judgingPhase: {
    // is judging phase in progress. Defaults to false. If submissionPhase inProgress is true,
    // then this MUST be false. Can be enforced in frontend.
    inProgress: { type: Boolean, default: false },
  },
  isComplete: { type: Boolean, default: false }, // is hackathon over. Defaults to false.
});

module.exports = mongoose.model('hackathon', hackathonSchema);
