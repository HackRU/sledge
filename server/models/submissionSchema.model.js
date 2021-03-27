const mongoose = require("mongoose");
const { Schema } = mongoose;

const submissionSchema = new Schema({
  projectID: mongoose.ObjectId,
  isSubmitted: Boolean,
  attributes: {
    title: String,
    description: String,
    technologies: [String],
  },
  urls: [{ label: String, url: String }],
  categories: [{ categoryID: String, categoryName: String }],
  flags: [String],
  numFlags: Number,
  removedFromJudging: Boolean,
});

module.exports = mongoose.model("submission", submissionSchema);
