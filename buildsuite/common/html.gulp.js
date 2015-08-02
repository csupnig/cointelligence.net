var gulp = require('gulp'),
    inject = require("gulp-inject"),
    path = require('path'),
    promisify = require('./utils/promisify');

var Builder = function (pkg, cfg) {
    this.pkg = pkg;
    this.cfg = cfg;
    this.name = "HTML";
};

Builder.prototype._doHTML = function() {
    var src = {
        css: path.join(this.cfg.dir.build, this.cfg.dir.assets, 'css', '**', '*.css'),
        js: path.join(this.cfg.dir.build, this.cfg.dir.assets, 'js', 'app', '**', '*.js'),
        vendor: path.join(this.cfg.dir.build, this.cfg.dir.assets, 'js', 'vendorfiles', '**', '*.js')
    };
    var destDir = path.join(this.cfg.dir.backend, this.cfg.dir.views);
    var ignorePath = this.cfg.dir.build;

    return gulp.src(this.cfg.src.views)
        .pipe(inject(gulp.src(src.vendor, {read: false}), {
            ignorePath: ignorePath,
            starttag: '<!-- inject:vendor:{{ext}} -->'
        }))
        .pipe(inject(gulp.src(src.js, {read: false}), {
            ignorePath: ignorePath,
            starttag: '<!-- inject:app:{{ext}} -->'
        }))
        .pipe(inject(gulp.src(src.css, {read: false}), {ignorePath: ignorePath}))
        .pipe(gulp.dest(destDir));
};


Builder.prototype.build = function(){
    return promisify(this._doHTML());
};

Builder.prototype.compile = function(){
    return promisify(this._doHTML());
};

Builder.prototype.watch = function() {
    var builder = this;
    gulp.watch(this.cfg.src.index, function(){
        builder.build();
    });
};

module.exports = Builder;
