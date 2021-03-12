const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
    categoryID: String,
    name: String, // category name
    companyName: String, // null if prize is not company-sponsored
    trackOrSuperlative: String // track/superlative
})

const categoryModel = mongoose.model("category", categorySchema);
module.exports = categoryModel;