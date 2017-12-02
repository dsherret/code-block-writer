var gulp = require("gulp");
var del = require("del");
var mocha = require("gulp-mocha");
var istanbul = require("gulp-istanbul");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");
var merge = require("merge2");
var p = require("./package.json");

gulp.task("typescript", ["clean-scripts"], function() {
    var tsProject = ts.createProject("tsconfig.json", {
        typescript: require("typescript")
    });

    var tsResult = gulp.src(["./src/**/*.ts"])
        .pipe(ts(tsProject));

    return merge([
        tsResult.dts.pipe(gulp.dest('./dist')),
        tsResult.js.pipe(gulp.dest("./dist"))
    ]);
});

gulp.task("pre-test", ["typescript"], function () {
    return gulp.src(["dist/**/*.js", "!dist/tests/**/*.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task("test", ["pre-test"], function() {
    return gulp.src("dist/tests/**/*.js")
        .pipe(mocha({ reporter: "progress" }))
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task("tslint", function() {
    return gulp.src(["./src/**/*.ts", "!./src/typings/**/*.d.ts"])
        .pipe(tslint({ formatter: "verbose" }))
        .pipe(tslint.report());
});

gulp.task("watch", function() {
    gulp.watch("./src/**/*.ts", ["tslint", "typescript"]);
});

gulp.task("clean-scripts", function(cb) {
    return del(["./dist/**/*{.js,.js.map}"], cb);
});

gulp.task("default", ["tslint", "typescript"]);
