var gulp = require("gulp");
var del = require("del");
var mocha = require("gulp-mocha");
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

gulp.task("test", ["typescript"], function() {
    return gulp.src("dist/tests/**/*.js")
        .pipe(mocha({ reporter: "progress" }));
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
