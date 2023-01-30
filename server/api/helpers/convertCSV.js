const csv = require('csv-parser');
const fs = require('fs');
const SubmissionModel = require('../../models/submission.model');

const convertCSV = () => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream('./testing/data/projects-fall-2021.csv')
      .pipe(csv())
      .on('data', (data) => {
        const submission = new SubmissionModel();
        submission.attributes.title = data['Project Title'];

        const tempUrls = [];
        tempUrls.push({
          label: 'Devpost URL',
          url: data['Submission Url'],
        });
        submission.urls = tempUrls;
        results.push(submission);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', reject);
  });
};
module.exports = {
  convertCSV,
};
