// const supertest = require('supertest');
const mongoose = require('mongoose');
// const app = require('../../index');
const config = require('../../config.json');

// const request = supertest(app);

beforeAll(async () => {
  // Connection URL, set it in config.json
  const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.testDbName}`;
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
});

describe('testing judge endpoints', () => {
  it('is a sample test', () => {
    expect(1).toEqual(1);
  });
});

afterAll(async (done) => {
  await mongoose.connection.dropDatabase(); // deletes database after testing
  mongoose.connection.close();
  done();
});
