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
    angularFilesort = require('gulp-angular-filesort'),
    Q = require("q");



var Builder = function (pkg, cfg) {
    this.pkg = pkg;
    this.cfg = cfg;
    this.name = "Typescript";
};

Builder.prototype._doVendor = function() {
    var destDir = path.join(this.cfg.dir.build, this.cfg.dir.assets, 'js', this.cfg.dir.vendor),
        jsFilter = gulpFilter('**/*.js'),
        stream = bowerFiles()
        .pipe(jsFilter)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min.' + this.pkg.version + '-' + this.cfg.builddate}))
        .pipe(gulp.dest(destDir));

    return promisify(stream);
};

Builder.prototype._getTypeScriptStream = function() {
    var src = this.cfg.src.ts;
    src.push(this.cfg.src.tslibs);
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
            noExternalResolve: true,
            sortOutput: true
        }));
};

Builder.prototype._getTemplateStream = function() {
    return gulp.src(this.cfg.src.tpl)
        .pipe(ngHtml2Js({
            moduleName: this.pkg.name + "TplCache"
        }))
        .pipe(concat(this.pkg.name.toLowerCase() + ".tpl.min.js"))
        .pipe(uglify());
};

Builder.prototype._buildTests = function( definitionstream){
    var destDir = path.join(this.cfg.dir.build, this.cfg.dir.assets, 'js', 'tests');

    var src = this.cfg.src.test;
    src.push(this.cfg.src.tslibs);
    var tsResult = mergeStream(gulp.src(src),definitionstream)
        .pipe(ts({
            declarationFiles: true,
            noExternalResolve: true,
            sortOutput: true
        }));

    return tsResult.js
        .pipe(concat('tests.js'))
        .pipe(rename({suffix: '.min.' + this.pkg.version + '-' + this.cfg.builddate}))
        .pipe(gulp.dest(destDir));
};


Builder.prototype._doTypeScript = function(compile) {
    var destDir = path.join(this.cfg.dir.build, this.cfg.dir.assets, 'js', 'app');
    var ts = this._getTypeScriptStream(),
        tplStream = this._getTemplateStream();
        promises = [],
        tsStream = ts.js;


    if (compile) {
        promises.push(promisify(mergeStream(tsStream,tplStream)
            .pipe(angularFilesort())
            .pipe(concat('main.js'))
            .pipe(uglify())
            .pipe(rename({suffix: '.min.' + this.pkg.version + '-' + this.cfg.builddate}))
            .pipe(gulp.dest(destDir))));
    } else {
        promises.push(promisify(tsStream
            .pipe(gulp.dest(destDir))));
        promises.push(promisify(tplStream
            .pipe(gulp.dest(destDir))));
    }
    return Q.all(promises);
};


Builder.prototype.build = function(){
    var builder = this;
    return builder._doVendor().then(function(){
        return builder._doTypeScript(true);
    });
};

Builder.prototype.compile = function(){
    var builder = this;
    return builder._doVendor().then(function(){
        return builder._doTypeScript(true);
    });
};

Builder.prototype.watch = function() {
    var builder = this;
    gulp.watch(this.cfg.src.ts, function(){
        builder._doTypeScript(false);
    });

    gulp.watch(this.cfg.src.tpl, function(){
        builder._doTypeScript(false);
    });
};

module.exports = Builder;
