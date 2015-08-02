var gulp = require('gulp'),
    promisify = require('./utils/promisify'),
    path = require('path');

var Builder = function (pkg, cfg) {
    this.pkg = pkg;
    this.cfg = cfg;
    this.name = "Fonts";
};

Builder.prototype._doFonts = function() {
    var destDir = path.join(this.cfg.dir.build, this.cfg.dir.assets, this.cfg.dir.fonts);
    return gulp.src(this.cfg.src.fonts)
        .pipe(gulp.dest(destDir));
};

Builder.prototype.build = function(){
    return promisify(this._doFonts());
};

Builder.prototype.compile = function(){
    return promisify(this._doFonts());
};

Builder.prototype.watch = function() {
    //We do nothing here
};

module.exports = Builder;
