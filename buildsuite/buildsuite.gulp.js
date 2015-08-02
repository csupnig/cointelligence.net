/**
 * Define dependencies
 */
var Q = require("q"),
    gulp = require('gulp'),
    Assets = require('./common/assets.gulp.js'),
    Backend = require('./common/backend.gulp.js'),
    Clean = require('./common/clean.gulp.js'),
    Css = require('./common/css.gulp.js'),
    Fonts = require('./common/fonts.gulp.js'),
    Html = require('./common/html.gulp.js'),
    Typescript = require('./common/typescript.gulp.js'),
    asyncLoop = require('./common/utils/asyncLoop.js'),
    log = require('./common/utils/logger.js'),
    livereload = require('gulp-livereload'),
    path = require('path');



module.exports = function (pkg, cfg, suitname) {

    var builders = [new Clean(pkg,cfg),
                    new Assets(pkg,cfg),
                    new Css(pkg,cfg),
                    new Fonts(pkg,cfg),
                    new Typescript(pkg,cfg),
                    new Html(pkg,cfg),
                    new Backend(pkg,cfg)];

    /**
     * Compile the application
     */
    gulp.task(suitname + ':compile', function () {
        return asyncLoop(builders, function(item){
            log(item.name);
            return item.compile();
        }).catch(function(){
            log("An Error happened.");
        });
    });

    /**
     * Build the application
     */
    gulp.task(suitname + ':build', function () {
        return asyncLoop(builders, function(item){
            log(item.name);
            return item.build();
        }).catch(function(){
            log("An Error happened.");
        });
    });


    gulp.task(suitname + ':watch', [suitname + ':build'], function () {

        asyncLoop(builders, function(item){
            var deferred = Q.defer();
            log("Watching " + item.name);
            item.watch();
            deferred.resolve();
            return deferred.promise;
        }).catch(function(){
            log("An Error happened.");
        });

        var buildDir = path.join(cfg.dir.build, '**');

        try {
            livereload.listen();
            gulp.watch(buildDir).on('change', livereload.changed);
        } catch (e) {
            var server = livereload();
            gulp.watch(buildDir).on('change', function (file) {
                log(file.path);
                server.changed(file.path);
            });
        }
    });

};
