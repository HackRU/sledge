const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const config = require('../../config.json');
const Hackathon = require('../../models/hackathonSchema.model');

const request = supertest(app);

const testHackathon = require('../../testHackathon.json');

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
    const res = await request
      .patch(`/api/admin/hackathons/${testHackathonId}`)
      .send(testHackathon);
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeNull();
    done();
  });

  /*
  it('Gets all hackathons', async (done) => {
    const res = await request.get('/api/admin/hackathons');
    done();
  });

  it('Gets the current hackathon', async (done) => {
    const res = await request.get('/api/admin/hackathons/current');
    done();
  });

  it('Gets the hackathon with the given ID', async (done) => {
    const res = await request.get(`/api/admin/hackathons/${testHackathonId}`);
    done();
  });

  it('Gets the phase of the hackathon with the given ID', async (done) => {
    const res = await request.get(`/api/admin/hackathons/${testHackathonId}/phase`);
    done();
  });
  */
});

afterAll(async (done) => {
  await mongoose.connection.dropDatabase(); // deletes database after testing
  mongoose.connection.close();
  done();
});
