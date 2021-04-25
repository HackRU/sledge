const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionSchema = new Schema({
  status: String, // submitted/not submitted
  attributes: {
    title: String,
    description: String,
    technologies: [String],
  },
  urls: [{ _id: false, label: String, url: String }],
  categories: [{ _id: false }],
  flags: [String],
  numFlags: Number,
  visible: Boolean,
});

module.exports = mongoose.model('submission', submissionSchema);
