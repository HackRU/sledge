/**
 * The Judges collection will be used to keep track of which categories and projects the judge is evaluating.
 */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const judgeSchema = new Schema({
  judgeID: String,
  judgeName: String,
  companyName: String,
  categoriesToJudge: [{ categoryID: String, categoryName: String }],
});

module.exports = mongoose.model('judge', judgeSchema);
