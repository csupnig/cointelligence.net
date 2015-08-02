var gulp = require('gulp'),
    gutil = require('gulp-util');

module.exports = function (message) {
        gutil.log(gutil.colors.green(message));
    };
