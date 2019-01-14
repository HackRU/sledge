var testFiles = [
];

function initTests() {
  let testPromises = testFiles.map(f =>
    window.SystemJS.import(f)
  );

  return Promise.all(testPromises).then(ms => {
    for (var m of ms) {
      m.test();
    }
  });
}

window.addEventListener("load", function () {
  window.SystemJS.import("mocha").then(r => {
    window.mocha.setup("bdd");
    initTests().then(() => {
      window.mocha.run();
    });
  });
});
