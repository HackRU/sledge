const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionSchema = new Schema({
  isSubmitted: Boolean,
  attributes: {
    title: String,
    description: String,
    technologies: [String],
  },
  urls: [{ _id: false, label: String, url: String }],
  categories: [{ _id: false, categoryID: String, categoryName: String }],
  flags: [String],
  numFlags: Number,
  removedFromJudging: Boolean,
});

module.exports = mongoose.model('submission', submissionSchema);
