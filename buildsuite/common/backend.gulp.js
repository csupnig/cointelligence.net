var gulp = require('gulp'),
    ngHtml2Js = require("gulp-ng-html2js"),
    uglify = require('gulp-uglify'),
    bowerFiles = require('gulp-bower-files'),
    gulpFilter = require("gulp-filter"),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    mergeStream = require('merge-stream'),
    karma = require('gulp-karma'),
    promisify = require('./utils/promisify'),
    ts = require('gulp-typescript'),
    tslint = require('gulp-tslint'),
    path = require('path'),
    stylish = require('gulp-tslint-stylish'),
    Q = require("q");



var Builder = function (pkg, cfg) {
    this.pkg = pkg;
    this.cfg = cfg;
    this.name = "Typescript Backend";
};

Builder.prototype._getTypeScriptStream = function() {
    var src = this.cfg.src.backend;
    src.push(this.cfg.src.backendlibs);
    src.push(this.cfg.src.commonts);
    src.push('!' + this.cfg.src.assets);
    return gulp.src(src)
        .pipe(tslint())
        .pipe(tslint.report(stylish, {
            emitError: false,
            sort: true,
            bell: false
        }))
        .pipe(ts({
            declarationFiles: true,
            sortOutput: true,
            module:'commonjs'
        }));
};


Builder.prototype._doTypeScript = function() {
    var destDir = path.join(this.cfg.dir.backend);
    var ts = this._getTypeScriptStream();
       tsStream = ts.js;
    return promisify(tsStream
        .pipe(gulp.dest(destDir)));
};


Builder.prototype.build = function(){
    var builder = this;
    return builder._doTypeScript();
};

Builder.prototype.compile = function(){
    var builder = this;
    return builder._doTypeScript();
};

Builder.prototype.watch = function() {
    var builder = this;
    gulp.watch(this.cfg.src.backend, function(){
        builder._doTypeScript(false);
    });
};

module.exports = Builder;
