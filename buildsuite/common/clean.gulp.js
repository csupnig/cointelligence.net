var gulp = require('gulp'),
    clean = require('gulp-clean'),
    promisify = require('./utils/promisify');

var Builder = function (pkg, cfg) {
    this.pkg = pkg;
    this.cfg = cfg;
    this.name = "Clean";
};

Builder.prototype._doClean = function() {
    return gulp.src([this.cfg.dir.build + '/*'], {read: false})
        .pipe(clean());
};

Builder.prototype.build = function(){
    return promisify(this._doClean());
};

Builder.prototype.compile = function(){
    return promisify(this._doClean());
};

Builder.prototype.watch = function() {
    //We do nothing here
};

module.exports = Builder;
