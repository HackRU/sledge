var child_process = require("child_process");
var gulp = require("gulp");
var path = require("path");
var shelljs = require("shelljs");

let basePath = __dirname;
let binPath = path.resolve(basePath, "node_modules/.bin");

function runCommand(cmd) {
  return new Promise( (resolve, reject) => {
    child_process.execFile(cmd[0], cmd.slice(1), function (error, stdout, stderr) {

      console.log("Command: " + cmd.join(" "));

      process.stdout.write(stdout);
      process.stdout.write(stderr);

      if (error) {
        console.log("Exit Status: " + error.code.toString());
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

gulp.task("build-server", function () {
  return runCommand([
    path.resolve(binPath, "tsc"),
    "--pretty",
    "--project", "tsconfig-server.json"
  ]);
});

gulp.task("build-client-typescript", function () {
  return runCommand([
    path.resolve(binPath, "tsc"),
    "--pretty",
    "--project", "tsconfig-client.json"
  ]);
});

gulp.task("build-client-scss", function () {
  return runCommand([
    path.resolve(binPath, "sass"),
    "src/client/global.scss",
    "public/client/global.css"
  ]).then(function () {
    return runCommand([
      path.resolve(binPath, "sass"),
      "--embed-sources", "--embed-source-map",
      "src/client/global.scss",
      "public/client/global.dev.css"
    ]);
  });
});

gulp.task("build-client-static", function () {
  return gulp.src(["static/**/*"]).pipe(gulp.dest("public"));
});

gulp.task("build-client", ["build-client-typescript", "build-client-scss", "build-client-static"]);

gulp.task("build", ["build-server", "build-client"]);

gulp.task("start", ["build"], function () {
  shelljs.exec(path.resolve(".", "bin/sledge.js"))
});
