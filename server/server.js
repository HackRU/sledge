const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017";

const dbName = "sledge";
const client = new MongoClient(url);

client.connect((e) => {
  assert.strictEqual(null, e);
  console.log("Successfully connected to server.");

  const db = client.db(dbName);

  client.close();
});
