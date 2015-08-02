var gulp = require('gulp'),
    less = require('gulp-less'),
    promisify = require('./utils/promisify'),
    path = require('path'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer');

var Builder = function (pkg, cfg) {
    this.pkg = pkg;
    this.cfg = cfg;
    this.name = "CSS";
};

Builder.prototype._doLess = function() {
    var destDir = path.join(this.cfg.dir.build, this.cfg.dir.assets, 'css');
    return gulp.src(this.cfg.src.less)
        .pipe(less({
            cleancss: true,
            compress: true
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(rename({suffix: '.min.' + this.pkg.version + '-' + this.cfg.builddate}))
        .pipe(gulp.dest(destDir));

};

Builder.prototype.build = function(){
    return promisify(this._doLess());
};

Builder.prototype.compile = function(){
    return promisify(this._doLess());
};

Builder.prototype.watch = function() {
    var builder = this;
    gulp.watch(this.cfg.src.allless, function(){
        builder.build();
    });
};

module.exports = Builder;
