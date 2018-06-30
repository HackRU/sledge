(function () {

var testFiles = [
  "/lib/client/setup/devpost.test.js"
];

function getDependencies() {
  var d = ["mocha"];
  for (var f of testFiles) {
    d.push(f);
  }
  return d;
}

var testModules = [];
function getSetters() {
  var s = [function (m){}];
  for (var f of testFiles) {
    s.push(function (m){testModules.push(m)});
  }
  return s;
}

function runTests() {
  window.mocha.setup("bdd");
  for (var m of testModules) {
    m.test();
  }
  window.mocha.run();
}

System.register(getDependencies(), function (_export) {
  _export("init", runTests);
  _export("default", { init: runTests });

  return {
    setters: getSetters(),
    execute: function () {}
  }
});

})();
