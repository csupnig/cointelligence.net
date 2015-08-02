var gulp = require('gulp'),
    Q = require("q");

module.exports = function (stream) {
    var deferred = Q.defer();

    stream.on('end', deferred.resolve)
        .on('error', deferred.reject);

    return deferred.promise;
};
