const mongoose = require("mongoose");
const config = require("./config.json");
const app = require("./app");
const port = 5000;

const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`; // Connection URL, set it in config.json
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(port, () => console.log(`Server running on port ${port}`));
