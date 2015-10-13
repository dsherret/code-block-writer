var gulp = require("gulp");
var del = require("del");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");
var merge = require('merge2');
var p = require("./package.json");

gulp.task("typescript", ["clean-scripts"], function() {
    var tsProject = ts.createProject("tsconfig.json", {
        typescript: require("typescript")
    });

    var tsResult = gulp.src(["./typings/**/*.d.ts", "./src/**/*.ts"])
        .pipe(ts(tsProject));

    return merge([
        tsResult.dts.pipe(gulp.dest('./dist')),
        tsResult.js.pipe(gulp.dest('./dist'))
    ]);
});

gulp.task("tslint", function() {
    return gulp.src(["./src/**/*.ts", "!./src/typings/**/*.d.ts"])
        .pipe(tslint())
        .pipe(tslint.report("verbose"));
});

gulp.task("watch", function() {
    gulp.watch("./src/**/*.ts", ["scripts"]);
});

gulp.task("clean-scripts", function(cb) {
    return del(["./dist/**/*"], cb);
});

gulp.task("default", ["tslint", "typescript", "watch"]);