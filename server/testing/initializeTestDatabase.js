const mongoose = require('mongoose');
const config = require('../config.json');
const Submission = require('../models/submission.model');
const testObjectGenerator = require('../testing/testObjectGenerator');

// Connection URL, set it in config.json
const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.testDbName}`;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// await addNSubmissions(5);

(async () => {
  try {
    await addNSubmissions(5);
  } catch (e) {
    console.log(e);
  } finally {
    mongoose.connection.close();
  }
})();

async function addNSubmissions(n) {
  for (let i = 1; i <= n; i++) {
    await Submission.create(
      testObjectGenerator.generateSubmission(),
      (err, submission) => {
        if (err) console.log(err);
        else console.log(`Added ${i} submission(s).`);
      },
    );
  }
}

// add 15 submissions to the database
// const n = 15;
