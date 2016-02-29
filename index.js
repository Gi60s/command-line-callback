var clc = require('./bin/command-line-callback.js');
var result = Object.assign({}, clc);
result.parser = require('./bin/parser.js');

Object.defineProperty(result, 'defaultCommand', {
    enumerable: true,
    configurable: true,
    get: function() { return clc.defaultCommand; },
    set: function(v) { clc.defaultCommand = v; }
});

module.exports = clc;