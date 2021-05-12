const mongoose = require('mongoose');
const config = require('./config.json');
const app = require('./index');

const port = 5000;

const url = `mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`; // Connection URL, set it in config.json

// connect to mongodb
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection
  .once('open', () => console.log('Connected!'))
  .on('error', (error) => {
    console.warn('Error : ', error);
  });

app.listen(port, () => console.log(`Server running on port ${port}`));
