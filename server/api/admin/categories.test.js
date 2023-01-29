const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const config = require('../../config.json');
const Category = require('../../models/category.model');

const request = supertest(app);

const testCategory = require('../../testing/data/testCategory.json');

let testCategoryId;

beforeAll(async () => {
  const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.testDbName}`; // Connection URL, set it in config.json
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
});

describe('testing category endpoints', () => {
  it('creates a new category', async (done) => {
    const res = await request.post('/api/admin/categories').send(testCategory);
    expect(res.statusCode).toEqual(200);

    testCategoryId = res.body.id; // res returns the id of the inserted submission

    await Category.findById(testCategoryId, (err, category) => {
      expect(category).not.toBeNull();
    });
    done();
  });

  it('returns all categories', async (done) => {
    const res = await request.get('/api/admin/categories').send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).not.toBeNull();
    done();
  });

  it('returns a category with specific ID', async (done) => {
    const res = await request
      .get(`/api/admin/categories/${testCategoryId}`)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(testCategoryId);
    done();
  });

  it('updates a category with a specific ID', async (done) => {
    const updatedFields = {
      name: 'Sample Category',
      companyName: 'Sample Company Name',
      type: 'superlative',
    };

    const res = await request
      .patch(`/api/admin/categories/${testCategoryId}`)
      .send(updatedFields);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(testCategoryId);

    await Category.findById(testCategoryId, (err, category) => {
      expect(category.name).toEqual(updatedFields.name);
      expect(category.companyName).toEqual(updatedFields.companyName);
      expect(category.type).toEqual(updatedFields.type);
    });

    done();
  });

  it('deletes a single category with a specific ID', async (done) => {
    const res = await request.delete(`/api/admin/categories/${testCategoryId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('success');

    await Category.findById(testCategoryId, (err, category) => {
      expect(category).toBeNull();
    });

    await request.post('/api/admin/categories').send(testCategory);
    done();
  });

  it('deletes all categories', async (done) => {
    const res = await request.delete('/api/admin/categories').send();
    expect(res.statusCode).toEqual(200);

    await Category.countDocuments({}, (err, count) => {
      expect(count).toEqual(0);
    });

    done();
  });
});

afterAll(async (done) => {
  await mongoose.connection.dropDatabase(); // deletes database after testing
  mongoose.connection.close();
  done();
});
