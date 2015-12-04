var argParser           = require('./arg-parser');

exports.alias = function(value) {
    return exports.string(value) && value.length <= 1;
};

exports.arrayOfString = function(value) {
    var i;
    if (!Array.isArray(value)) return false;
    for (i = 0; i < value.length; i++) {
        if (!exports.string(value[i])) return false;
    }
    return true;
};

exports.arrayOfSections = function(value) {
    var i;
    if (!Array.isArray(value)) return false;
    for (i = 0; i < value.length; i++) {
        if (!exports.object(value[i])) return false;
        if (!value[i].hasOwnProperty('title')) return false;
        if (!value[i].hasOwnProperty('body')) return false;
    }
    return true;
};

exports.boolean = function(value) {
    return typeof value === 'boolean' || value instanceof Boolean;
};

exports.function = function(value) {
    return typeof value === 'function' || value instanceof Function;
};

exports.number = function(value) {
    return typeof value === 'number' || value instanceof Number;
};

exports.object = function(value) {
    return typeof value === 'object' || value instanceof Object;
};

exports.objectNumberMap = function(value) {
    var i;
    var keys;
    if (!exports.object(value)) return false;
    keys = Object.keys(value);
    for (i = 0; i < keys.length; i++) {
        if (!exports.number(keys[i])) return false;
    }
    return true;
};

exports.objectStringMap = function(value) {
    var i;
    var key;
    var keys;
    if (!exports.plainObject(value)) return false;
    keys = Object.keys(value);
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        if (!exports.string(value[key])) return false;
    }
    return true;
};

exports.parserFunction = function(value) {
    return exports.function(value) && !!argParser.get(value);
};

exports.plainObject = function(value) {
    return exports.object(value) && value.constructor.name === 'Object';
};

exports.string = function(value) {
    return typeof value === 'string' || value instanceof String;
};

exports.symbol = function() {
    return typeof value === 'symbol';
};