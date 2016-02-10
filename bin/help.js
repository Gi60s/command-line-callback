var chalk           = require('chalk');
var format          = require('cli-format');

var help = exports;

exports.columns = function(left, right, width) {
    if (!width) width = 16;
    return format.columns.wrap(left, right, { width: [width, null], paddingLeft: '  ', paddingMiddle: '  ' });
};

exports.heading = function(content) {
    return format.wrap(chalk.bold.underline(content)) + '\n\n';
};

exports.section = function(title, body) {
    return help.heading(title) +
            format.wrap(body, { paddingLeft: '  ', justify: true });
};

exports.synopsis = function(appName, body) {
    var content = body
        .map(function(v) {
            return appName + ' ' + v;
        })
        .join('\n');
    return help.section('Synopsis', content);
};

/**
 * Take an array of strings and return the length of the widest string.
 * @param {string[]} array
 * @returns {number}
 */
exports.width = function(array, maxWidth) {
    var result = array.reduce(function(prev, curr) {
        return prev > curr.length ? prev : curr.length;
    }, 0);
    return result > maxWidth ? maxWidth : result;
};