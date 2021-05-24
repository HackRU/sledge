const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const config = require('../config.json');
const Submission = require('../models/submissionSchema.model');
const testSubmission = require('../testSubmission.json');
const modifiedTestSubmission = require('../modifiedTestSubmission.json');

const request = supertest(app);

const testTeamID = mongoose.Types.ObjectId();

// this id will be automatically generated for the below submission once it is added to the database
let testSubmissionId;

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
      .post(`/api/submissions/${testTeamID}/create`)
      .send(testSubmission);
    expect(res.statusCode).toEqual(200);

    testSubmissionId = res.body.id; // res returns the id of the inserted submission

    await Submission.findById(testSubmissionId, (err, submission) => {
      expect(submission).not.toBeNull();
    });
    done();
  });

  it('updates the submission details', async (done) => {
    const res = await request
      .patch(`/api/submissions/${testTeamID}/${testSubmissionId}`)
      .send(modifiedTestSubmission);
    expect(res.statusCode).toEqual(200);

    await Submission.findById(testSubmissionId, (err, submission) => {
      expect(submission.state).toEqual(modifiedTestSubmission.state);
      expect(submission.attributes.title).toEqual(
        modifiedTestSubmission.attributes.title,
      );
    });

    done();
  });

  it('retrieves all submissions', async (done) => {
    const res = await request.get('/api/submissions').send(testSubmission);
    expect(res.statusCode).toEqual(200);
    done();
  });

  // it('sets isSubmitted of given submission to true', async (done) => {
  //   const res = await request.patch(
  //     `/api/submissions/${testTeamID}/${testSubmissionId}/submit`
  //   );
  //   expect(res.statusCode).toEqual(200);
  //   expect(res.body.isSubmitted).toEqual(true);
  //   done();
  // });

  // it('sets isSubmitted of given submission to false', async (done) => {
  //   const res = await request.patch(
  //     `/api/submissions/${testTeamID}/${testSubmissionId}/unsubmit`
  //   );
  //   expect(res.statusCode).toEqual(200);
  //   expect(res.body.isSubmitted).toEqual(false);
  //   done();
  // });
});

afterAll(async (done) => {
  await mongoose.connection.dropDatabase(); // deletes database after testing
  mongoose.connection.close();
  done();
});
