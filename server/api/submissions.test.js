const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const config = require("../config.json");
const request = supertest(app);

var testSubmission = require("../testSubmission.json");

// Create test data. Eventually put this into a fixture?
const testTeamID = mongoose.Types.ObjectId();
var testSubmissionId; // this id will be automatically generated for the below submission after that submission is added to the database

beforeAll(async () => {
  const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.testDbName}`; // Connection URL, set it in config.json
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
});

describe("testing submission endpoints", () => {
  it("adds a new submission", async (done) => {
    const res = await request.post(`/api/submissions/${testTeamID}/create`).send(testSubmission);
    expect(res.statusCode).toEqual(200);
    expect(res.body.attributes.title).toEqual("A Test Hack");
    testSubmissionId = res.body._id;
    done();
  });

  it("gets the submission details", async (done) => {
    const res = await request.get(`/api/submissions/${testTeamID}/${testSubmissionId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.attributes.title).toEqual("A Test Hack");
    done();
  });

  it("retrieves all submissions", async (done) => {
    const res = await request.get(`/api/submissions`).send(testSubmission);
    expect(res.statusCode).toEqual(200);
    done();
  });

  it("sets isSubmitted of given submission to true", async (done) => {
    const res = await request.patch(`/api/submissions/${testTeamID}/${testSubmissionId}/submit`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.isSubmitted).toEqual(true);
    done();
  });

  it("sets isSubmitted of given submission to false", async (done) => {
    const res = await request.patch(`/api/submissions/${testTeamID}/${testSubmissionId}/unsubmit`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.isSubmitted).toEqual(false);
    done();
  });
});

removeAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
};

afterAll(async (done) => {
  await removeAllCollections(); // deletes everything in the database after testing
  mongoose.connection.close();
  done();
});
