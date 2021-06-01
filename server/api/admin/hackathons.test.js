const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const config = require('../../config.json');
const Hackathon = require('../../models/hackathonSchema.model');

const request = supertest(app);

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
});

afterAll(async (done) => {
  await mongoose.connection.dropDatabase(); // deletes database after testing
  mongoose.connection.close();
  done();
});
