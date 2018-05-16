var gulp = require("gulp");
var path = require("path");
var shelljs = require("shelljs");
var sourcemaps = require("gulp-sourcemaps");
var typescript = require("gulp-typescript");
var webpack = require("webpack-stream");

let basePath = __dirname;

gulp.task("build-server-typescript", function () {
    let ts = typescript.createProject("tsconfig.json", {
        module: "commonjs",
        esModuleInterop: true,
        target: "es6",
        moduleResolution: "node",
    });

    return gulp.src(["src/**/*.ts"])
        .pipe( sourcemaps.init() )
        .pipe( ts() )
        .pipe( sourcemaps.write() )
        .pipe( gulp.dest("lib") );
});

gulp.task("build-server-json", function () {
    return gulp.src(["src/**/*.json"])
        .pipe( gulp.dest("lib") );
});

gulp.task("build-server", ["build-server-typescript", "build-server-json"]);

gulp.task("build-client", function () {
    let wp = webpack({
        devtool: "inline-source-map",
        entry: ["./src/client/entry.ts", "./src/client/global.scss"],

        module: {
            rules: [{
                test: /\.tsx?$/,
                loader: "ts-loader",
                include: path.resolve(basePath, "src"),
                options: {
                    compilerOptions: {
                        target: "es6"
                    }
                }
            }, {
                test: /\.scss?$/,
                use: ["style-loader", "css-loader", "sass-loader"],
                include: path.resolve(basePath, "src")
            }]
        },

        output: {
            filename: "bundle.js"
        }
    });

    return gulp.src("src/")
        .pipe( wp )
        .pipe( gulp.dest("lib/") );
});

gulp.task("build", ["build-server", "build-client"]);

gulp.task("start", ["build"], function () {
    let err = shelljs.exec("./bin/sledge.js");
    if (err.code) {
        throw new Error("./bin/sledge.js exited with status "+err.code.toString(10));
    }
});
