const csv = require('csv-parser')
const fs = require('fs');
const submissionModel = require('../models/submission.model');
const results = [];

const subs = [];

fs.createReadStream('../files/hackRU.csv')
  .pipe(csv())
  .on('data', (data) => {
    //console.log(data);

    var s = new submissionModel()
    s.attributes.title = data["Project Title"];
    
    let tempUrls = [];

    tempUrls.push({
      "label": "Devpost URL",
      "url": data["Submission Url"] 
    });

    s.urls = tempUrls;
    subs.push(s);


    //console.log(s);

    /*
    s.save(function(err, result){
      if (err) {
        console.log(err);
      }
      else {
        console.log("success");
      }
    });
    */
  
    
    results.push(data)
    
  })
  .on('end', () => {
    //console.log(subs);
    submissionModel.insertMany(subs, function (err, result) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(result);
      }
    })

  });


//Turn results (a stream) into JSON object

module.exports = results;
