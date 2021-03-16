const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config.json");

const request = supertest(app);

// eventually put this into a fixture?
const testTeamID = "abc123";
const testSubmission = {
  projectID: "abc123",
  isSubmitted: false,
  attributes: {
    title: "A Test Hack",
    description: "Our hack is very cool! I like this hack, and my teammates like it too.",
    technologies: ["MongoDB", "JSON"],
  },
  urls: [
    { label: "GitHub Repository", url: "https://github.com/hackru/sledge" },
    { label: "YouTube Video Demo", url: "https://youtube.com/idk" },
  ],
  categories: [{ categoryID: "321cba", categoryName: "Best Beginner Hack" }],
};

beforeAll(async () => {
  const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.testDbName}`; // Connection URL, set it in config.json
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

describe("performs database functions", () => {
  it("adds a new submission", async (done) => {
    const res = await request.post(`/api/submissions/${testTeamID}`).send(testSubmission);
    expect(res.statusCode).toEqual(200);
    done();
  });

  it("gets the submission details", async (done) => {
    const res = await request.get(`/api/submissions/${testTeamID}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.attributes.title).toEqual("A Test Hack");
    done();
  });
});

// removeAllCollections = async () => {
//   const collections = Object.keys(mongoose.connection.collections);
//   for (const collectionName of collections) {
//     const collection = mongoose.connection.collections[collectionName];
//     await collection.deleteMany();
//   }
// };

afterAll((done) => {
  //   await removeAllCollections();
  mongoose.connection.close();
  done();
});
