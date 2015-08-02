var gulp = require('gulp'),
    path = require('path'),
    promisify = require('./utils/promisify');

var Builder = function (pkg, cfg) {
    this.pkg = pkg;
    this.cfg = cfg;
    this.name = "Assets";
};

Builder.prototype._copyFiles = function(src, dst) {
    var destDir = path.join(this.cfg.dir.build, dst);
    return gulp.src(src)
        .pipe(gulp.dest(destDir));
};

Builder.prototype._langs = function() {
    return promisify(this._copyFiles(this.cfg.src.langs, this.cfg.dir.langs));
};

Builder.prototype._locales = function() {
    return promisify(this._copyFiles( this.cfg.src.locales, this.cfg.dir.langs));
};

Builder.prototype._assets = function() {
    return promisify(this._copyFiles( this.cfg.src.assets, this.cfg.dir.assets));
};

Builder.prototype._combined = function() {
    var builder = this;
    return builder._locales()
        .then(function(){
            return builder._langs();
        }).then(function(){
           return builder._assets();
        });
};

Builder.prototype.build = function(){
    return this._combined();
};

Builder.prototype.compile = function(){
    return this._combined();
};

Builder.prototype.watch = function() {
    var builder = this;
    gulp.watch(this.cfg.src.langs, function(){
        builder._langs();
    });
    gulp.watch(this.cfg.src.locales, function(){
        builder._locales();
    });
    gulp.watch(this.cfg.src.assets, function(){
        builder._assets();
    });
};

module.exports = Builder;
