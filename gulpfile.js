var child_process = require("child_process");
var path = require("path");

var clean = require("gulp-clean");
var gulp = require("gulp");
var shell = require("shelljs");
var tslint = require("gulp-tslint");
var mocha = require("gulp-mocha");

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
        if (error.code) {
          console.log("Exit Status: " + error.code.toString());
        } else {
          console.log("Command failed for weird reasons.");
          console.log(error);
        }
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

gulp.task("test", ["test-client", "test-server"]);

gulp.task("test-client", ["build-client"], function () {
  return new Promise(function (resolve, reject) {
    console.log("Starting server on port 8123 for testing");
    var server = child_process.fork("./bin/sledge", ["8123"], {
      stdio: ["ignore", "ignore", process.stderr, "ipc"]
    });
    var bound = false;
    server.on("disconnect", function () {
      if (!bound) throw new Error("Disconnected from server before bound");
    });
    server.on("message", function (m) {
      if (m !== "bound") return;

      bound = true;
      runCommand([
        path.resolve(binPath, "mocha-headless-chrome"),
        "-f", "http://localhost:8123/test.html",
        "-a", "no-sandbox"
      ]).then(function (r) {
        console.log("Killing Test Server");
        server.kill();
        resolve(r);
      }).catch(reject);
  });
    });
});

gulp.task("test-server", ["build-server"], function () {
  return gulp.src(["lib/**/*.test.js"], {read: false})
    .pipe(mocha());
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

gulp.task("build-client", ["build-client-typescript", "build-client-scss", "build-client-static", "build-client-src"]);

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

gulp.task("build-client-src", function () {
  return gulp.src(["src/**/*"]).pipe(gulp.dest("public/src"));
});

gulp.task("start", ["build"], function () {
  shell.exec(path.resolve(".","sledge"))
});

gulp.task("clean", function () {
  return gulp.src(["lib", "public"], {read: false})
    .pipe(clean());
});
