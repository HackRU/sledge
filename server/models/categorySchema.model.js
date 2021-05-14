const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema({
  name: String, // category name
  companyName: String, // null if prize is not company-sponsored
  type: String, // track/superlative
});

module.exports = mongoose.model('category', categorySchema);
