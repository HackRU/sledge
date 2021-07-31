const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const config = require('../config.json');
const Submission = require('../models/submission.model');
const testObjectGenerator = require('../testing/testObjectGenerator');
// const testSubmission = require('../testData/testSubmission.json');

const request = supertest(app);

// const testTeamID = mongoose.Types.ObjectId();

// This id will be automatically generated for the below submission once it is added to the database
let testSubmissionId;

const testSubmission = testObjectGenerator.generateSubmission();

beforeAll(async () => {
  // Connection URL, set it in config.json
  const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.testDbName}`;
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
});

describe('testing submission endpoints', () => {
  it('adds a new submission', async (done) => {
    const res = await request
      .post(`/api/submissions`)
      .send(testSubmission);
    expect(res.statusCode).toEqual(200);

    // res returns the id of the inserted submission
    testSubmissionId = res.body.id;

    await Submission.findById(testSubmissionId, (err, submission) => {
      expect(submission).not.toBeNull();
    });

    done();
  });

  it('updates the submission details', async (done) => {
    // Modify the submission
    testSubmission.state = 'unsubmitted';
    testSubmission.attributes.title = 'A Renamed Test Hack';

    const res = await request
      .patch(`/api/submissions/${testSubmissionId}`)
      .send(testSubmission);
    expect(res.statusCode).toEqual(200);

    await Submission.findById(testSubmissionId, (err, submission) => {
      expect(submission.state).toEqual('unsubmitted');
      expect(submission.attributes.title).toEqual('A Renamed Test Hack');
    });

    done();
  });

  it('retrieves all submissions', async (done) => {
    const res = await request.get('/api/submissions').send(testSubmission);
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeNull();

    done();
  });
});

afterAll(async (done) => {
  // Delete database after testing
  await mongoose.connection.dropDatabase();
  mongoose.connection.close();
  done();
});
