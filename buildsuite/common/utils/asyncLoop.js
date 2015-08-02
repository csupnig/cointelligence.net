var gulp = require('gulp'),
    Q = require("q"),
    log = require("./logger.js");

module.exports = function (items, doLoopBody) {
    var i = 0, d = Q.defer();

    nextIteration();

    return d.promise;

    function nextIteration() {
        if( i < items.length ) {
            doLoopBody(items[i], i, items).then(
                function() {
                    i++;
                    nextIteration();
                },
                onError
            );
        }
        else {
            d.resolve();
        }
    }

    function onError(reason) {
        log("ERROR",reason);
        d.reject(reason);
    }
};
