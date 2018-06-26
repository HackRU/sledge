var child_process = require("child_process");
var path = require("path");

var clean = require("gulp-clean");
var gulp = require("gulp");
var shell = require("shelljs");
var tslint = require("gulp-tslint");

let basePath = __dirname;
let binPath = path.resolve(basePath, "node_modules/.bin");

// TODO: Prefer programmatic APIs to commands
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

gulp.task("default", ["build"]);

gulp.task("lint", function () {
  return gulp.src(["src/**/*.ts", "src/**/*.tsx"])
    .pipe(tslint())
    .pipe(tslint.report());
});

gulp.task("build", ["build-server", "build-client"]);

gulp.task("build-server", ["build-server-typescript", "build-server-schemas"]);

gulp.task("build-server-typescript", function () {
  return runCommand([
    path.resolve(binPath, "tsc"),
    "--pretty",
    "--project", "tsconfig-server.json"
  ]);
});

gulp.task("build-server-schemas", function () {
  // TODO
});

gulp.task("build-client", ["build-client-typescript", "build-client-scss", "build-client-static"]);

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
    "--embed-sources",
    "src/client/global.scss",
    "public/global.css"
  ]);
});

gulp.task("build-client-static", function () {
  return gulp.src(["static/**/*"]).pipe(gulp.dest("public"));
});

gulp.task("start", ["build"], function () {
  shell.exec(path.resolve(".","sledge"))
});

gulp.task("clean", function () {
  return gulp.src(["lib", "public"], {read: false})
    .pipe(clean());
});
