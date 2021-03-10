import mongoose from "mongoose";
const {Schema} = mongoose;

const submissionSchema = new Schema({
    projectID: String,
    isSubmitted: Boolean,
    attributes: {
        title: String,
        description: String,
        technologies: [{String}],
    },
    urls: [{label: String, url: String}],
    categories: [{categoryID: String, categoryName: String}]
})

const submissionEntry = mongoose.model("submission", submissionSchema);
module.exports = submissionEntry;