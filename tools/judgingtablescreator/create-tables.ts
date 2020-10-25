const axios = require("axios");

if (process.argv.length != 3) {
  console.log("usage: node create-tables.js <num_tables>");
}

const num_tables = parseInt(process.argv[2]);
var config_file = "";

try {
  config_file = require("./config.json");
} catch (err) {
  throw "You need a config.json file to run this script.";
}

const post_method = "post";
const post_url = "https://slack.com/api/conversations.create";
const post_headers_authorization = "Bearer ".concat(config_file["slack-token"]);
const post_headers_content_type = "application/json;charset=UTF-8";

var post_config, post_data;
var table_name = "judging-table-";

for (var i = 1; i <= num_tables; i++) {
  // creating table name and converting to json
  table_name = "judging-table-".concat(i.toString());

  console.log("creating table ".concat(table_name));

  post_data = JSON.stringify({ name: table_name });

  // setting headers for axios post
  post_config = {
    method: post_method,
    url: post_url,
    headers: {
      Authorization: post_headers_authorization,
      "Content-Type": post_headers_content_type,
    },
    data: post_data,
  };

  axios(post_config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
}
