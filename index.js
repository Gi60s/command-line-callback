
var clc = Object.assign({}, require('./bin/command-line-callback.js'));
clc.args = require('./bin/command-line-args');
clc.config = require('./bin/command-config');
clc.formatter = require('./bin/help-formatter');
clc.options = require('./bin/command-options');

module.exports = clc;