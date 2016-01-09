var gulp = require("gulp");
var del = require("del");
var mocha = require("gulp-mocha");
var istanbul = require("gulp-istanbul");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");
var sourcemaps = require("gulp-sourcemaps");
var p = require("./package.json");

gulp.task("typescript", ["clean-scripts"], function() {
    var tsProject = ts.createProject("tsconfig.json", {
        typescript: require("typescript")
    });

    return gulp.src(["./src/typings/**/*.d.ts", "./src/**/*.ts"])
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./dist"));
});

gulp.task("pre-test", function () {
    return gulp.src(["dist/**/*.js", "!dist/tests/**/*.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task("test", ["typescript", "pre-test"], function() {
    return gulp.src("dist/tests/**/*.js")
        .pipe(mocha({ reporter: "progress" }))
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task("tslint", function() {
    return gulp.src(["./src/**/*.ts", "!./src/typings/**/*.d.ts"])
        .pipe(tslint())
        .pipe(tslint.report("verbose"));
});

gulp.task("watch", function() {
    gulp.watch("./src/**/*.ts", ["tslint", "typescript"]);
});

gulp.task("clean-scripts", function(cb) {
    return del(["./dist/**/*{.js,.js.map}"], cb);
});

gulp.task("default", ["tslint", "typescript"]);
