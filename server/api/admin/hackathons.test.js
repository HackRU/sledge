const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const config = require('../../config.json');
const Hackathon = require('../../models/hackathon.model');

const request = supertest(app);

const testCategory = require('../../testData/testCategory.json');
const testHackathon = require('../../testData/testHackathon.json');

let testHackathonId;

beforeAll(async () => {
  const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.testDbName}`; // Connection URL, set it in config.json
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
});

describe('testing hackathon endpoints', () => {
  it('Sample test', async (done) => {
    expect(1).toEqual(1);
    done();
  });

  it('Adds an empty hackathon', async (done) => {
    const res = await request.post('/api/admin/hackathons');
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeNull();

    testHackathonId = res.body.id;

    await Hackathon.findById(testHackathonId, (err, hackathon) => {
      expect(hackathon).not.toBeNull();
    });
    done();
  });

  it('Updates the given hackathon with the given ID', async (done) => {
    const res1 = await request.post('/api/admin/categories').send(testCategory);
    testHackathon.categories.push(res1.body.id);

    const resFinal = await request
      .patch(`/api/admin/hackathons/${testHackathonId}`)
      .send(testHackathon);
    expect(resFinal.statusCode).toEqual(200);
    expect(resFinal.body).not.toBeNull();

    await Hackathon.findById(testHackathonId, (err, hackathon) => {
      expect(hackathon).not.toBeNull();
      expect(hackathon.categories[0].toString()).toEqual(
        testHackathon.categories[0],
      );
      expect(hackathon.isComplete).toEqual(testHackathon.isComplete);
      expect(hackathon.judgingPhase.inProgress).toEqual(
        testHackathon.judgingPhase.inProgress,
      );
      expect(hackathon.season).toEqual(testHackathon.season);
      expect(hackathon.submissionPhase.inProgress).toEqual(
        testHackathon.submissionPhase.inProgress,
      );
      expect(hackathon.submissionPhase.deadline).toEqual(
        testHackathon.submissionPhase.deadline,
      );
    });
    done();
  });

  it('Gets all hackathons', async (done) => {
    const res = await request.get('/api/admin/hackathons');
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeNull();
    done();
  });

  it('Gets the current hackathon', async (done) => {
    const res = await request.get('/api/admin/hackathons/current');
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeNull();
    // expect(res.body._id).toEqual(testHackathonId);
    done();
  });

  it('Gets the hackathon with the given ID', async (done) => {
    const res = await request.get(`/api/admin/hackathons/${testHackathonId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeNull();
    // expect(res.body._id).toEqual(testHackathonId);
    done();
  });

  it('Gets the phase of the hackathon with the given ID', async (done) => {
    const res = await request.get(
      `/api/admin/hackathons/${testHackathonId}/phase`,
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeNull();
    expect(res.body.message).toEqual('submission');
    done();
  });
});

afterAll(async (done) => {
  await mongoose.connection.dropDatabase(); // deletes database after testing
  mongoose.connection.close();
  done();
});
