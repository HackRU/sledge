const mongoose = require('mongoose');
const { Schema } = mongoose;

const judgeSchema = new Schema({
  judgeName: String,
  companyName: String,
  categoriesToJudge: [{ categoryID: String, categoryName: String }],
});

module.exports = mongoose.model('judge', judgeSchema);
