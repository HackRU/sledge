const csv = require('csv-parser')
const fs = require('fs');
const submissionModel = require('../../models/submission.model');


const convertCSV = () => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream('./testing/data/projects-fall-2021.csv')
    .pipe(csv())
    .on('data', (data) => {
      let submission = new submissionModel()
      submission.attributes.title = data["Project Title"];
      
      let tempUrls = [];
      tempUrls.push({
        "label": "Devpost URL",
        "url": data["Submission Url"] 
      });
      submission.urls = tempUrls;
      results.push(submission);
    })
    .on('end', () => {
      console.log('Done.');
      resolve(results);
    })
    .on('error', reject)
  })
}
module.exports = {
  convertCSV,
};