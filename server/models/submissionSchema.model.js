const mongoose = require("mongoose");
const { Schema } = mongoose;

const submissionSchema = new Schema({
  projectID: String,
  isSubmitted: Boolean,
  attributes: {
    title: String,
    description: String,
    technologies: [String],
  },
  urls: [{ label: String, url: String }],
  categories: [{ categoryID: String, categoryName: String }],
});

module.exports = mongoose.model("submission", submissionSchema);
