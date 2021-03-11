import mongoose from "mongoose";
const {Schema} = mongoose;

const categorySchema = new Schema({
    categoryID: String,
    name: String, // category name
    companyName: String, // null if prize is not company-sponsored
    trackOrSuperlative: String // track/superlative
})

const category = mongoose.model("category", categorySchema);
module.exports = category;