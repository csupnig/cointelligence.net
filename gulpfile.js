
/**
 * Load config files
 */
var pkg = require('./package.json');
var cfg = require('./build.config.js');
var moment = require('moment');

/**
 * Prepare configuration
 */
cfg.builddate = moment().format("YYYYMMDD_HHmm");

/**
 * Load Dependecies
 */
require('./buildsuite/buildsuite.gulp.js')(pkg, cfg, 'app');