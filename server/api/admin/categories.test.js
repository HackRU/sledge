const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const config = require('../../config.json');
const Category = require('../../models/categorySchema.model');
const request = supertest(app);

const testCategory = require('../../testCategory.json');

let testCategoryID;

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
  
  it ('creates a new category', async (done) => {
    const res = await request.post(`/api/admin/categories/create`).send(testCategory);
    expect(res.statusCode).toEqual(200);

    testCategoryID = res.body.id; // res returns the id of the inserted submission

    await Category.findById(testCategoryID, (err, category) => {
      expect(category).not.toBeNull();
      if (err != null) {
        console.log(err);
      }
    });
    done();
  });

});

afterAll(async (done) => {
  await mongoose.connection.dropDatabase(); // deletes database after testing
  mongoose.connection.close();
  done();
});
