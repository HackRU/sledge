// const supertest = require('supertest');
const mongoose = require('mongoose');
// const app = require('../../index');
const config = require('../../config.json');

// const request = supertest(app);

beforeAll(async () => {
  const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.testDbName}`; // Connection URL, set it in config.json
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
});

describe('testing category endpoints', () => {
  it('is a sample test', () => {
    expect(1).toEqual(1);
  });
});

afterAll(async (done) => {
  await mongoose.connection.dropDatabase(); // deletes database after testing
  mongoose.connection.close();
  done();
});
