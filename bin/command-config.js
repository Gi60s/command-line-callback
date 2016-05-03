"use strict";
// Define command configurations

var CustomError     = require('custom-error-instance');
var is              = require('./is-type');

var Err = CustomError('CmdCfgError');
Err.invalid = CustomError(Err, { message: 'Invalid value.', code: 'EINVLD' }, CustomError.factory.expectReceive);
Err.aliasConflict = CustomError(Err, { code: 'EALIAS' });


Object.defineProperty(exports, 'error', {
    enumerable: false,
    configurable: true,
    value: Err,
    writable: true
});



/**
 * Get a map of alias names and the option name that they refer to.
 * @param {object} options
 * @returns {object}
 */
exports.aliasMap = function(options) {
    var opts = exports.normalizeOptions(options);
    var result = {};
    Object.keys(opts).forEach(function(name) {
        var option = opts[name];
        if (option.hasOwnProperty('alias') && option.alias) {
            if (result.hasOwnProperty(option.alias)) {
                throw Err.aliasConflict({
                    message: 'Two options use the same alias: ' + result[option.alias] + ' and ' + name,
                    conflict: [result[option.alias], name]
                });
            }
            result[option.alias] = name;
        }
    });
    return result;
};

exports.defaultTransform = function (v) {
    return v;
};

exports.defaultValidate = function () {
    return true
};

/**
 * Check to see if an object has already been normalized.
 * @param {object} obj
 */
exports.isNormalized = function(obj) {
    return obj.hasOwnProperty('__normalized');
};

/**
 * Normalize and validate a command configuration.
 * @param {object} configuration
 * @returns {object}
 */
exports.normalize = function(configuration) {
    var result = configuration;

    if (!is.plainObject(configuration)) throw Err.invalid({ message: 'Invalid configuration.', expected: 'an object', received: configuration });
    if (!exports.isNormalized(configuration)) {
        result = Object.assign({}, configuration);
        processProperty(result, 'brief', '', 'a string', is.string);
        processProperty(result, 'description', '', 'a string', is.string);
        processProperty(result, 'defaultOption', '', 'a string', is.string);
        processProperty(result, 'groups', {}, 'an object mapping group names to string labels', is.groupMap);
        processProperty(result, 'options', {}, 'a plain object', is.object);
        processProperty(result, 'sections', [], 'an array of objects like { title: "foo", body: "bar" }', is.arrayOfSections);
        processProperty(result, 'synopsis', [], 'an array of string', is.arrayOfString);
        result.options = exports.normalizeOptions(result.options);
        markAsNormalized(result);
    }

    return result;
};

/**
 * Normalize and validate a single configuration option.
 * @param {object} option
 * @returns {object}
 */
exports.normalizeOption = function(option) {
    var result = option;

    if (!is.plainObject(option)) throw Err.invalid({ message: 'Invalid configuration option.', expected: 'an object', received: option });
    if (!exports.isNormalized(option)) {
        result = Object.assign({}, option);
        processOption(result, 'alias', '', 'a string of length 1', is.alias);
        processOption(result, 'description', '', 'a string or a function', (v) => is.string(v) || is.function(v));
        processOption(result, 'env', '', 'a string', is.string);
        processOption(result, 'group', '', 'a string', is.string);
        processOption(result, 'hidden', false, 'a boolean', is.boolean);
        processOption(result, 'multiple', false, 'a boolean', is.boolean);
        processOption(result, 'required', false, 'a boolean', is.boolean);
        processOption(result, 'transform', exports.defaultTransform, 'a function', is.function);
        processOption(result, 'type', Boolean, 'a function with a defined command line arg parser', is.parserFunction);
        processOption(result, 'validate', exports.defaultValidate, 'a function', is.function);

        if (result.required && result.hasOwnProperty('defaultValue')) {
            throw Err('Command configuration option cannot have required as true and a default value because they are mutually exclusive');
        } else if (!result.required && result.hasOwnProperty('defaultValue') && !result.validate(result.defaultValue)) {
            throw Err('Command configuration option defaultValue does not pass validation.');
        }

        markAsNormalized(result);
    }

    return result;
};

/**
 * Normalize and validate a configuration options.
 * @param {object} options
 * @returns {object}
 */
exports.normalizeOptions = function(options) {
    var result = options;

    if (!is.plainObject(options)) {
        throw Err.invalid({
            message: 'Command configuration options must be an object map.',
            received: options
        });
    }

    if (!exports.isNormalized(options)) {
        result = {};
        Object.keys(options).forEach(function(name) {
            if (options[name]) result[name] = exports.normalizeOption(options[name]);
        });
        markAsNormalized(result);
    }

    return result;
};

function markAsNormalized(obj) {
    Object.defineProperty(obj, '__normalized', {
        configurable: false,
        enumerable: false,
        value: true,
        writable: false
    });
}

function processItem(type, map, name, defaultValue, expected, validate, throwErr) {
    var err;
    var value;
    if (typeof throwErr === 'undefined') throwErr = true;
    if (!map.hasOwnProperty(name)) map[name] = defaultValue;
    value = map[name];
    if (!validate(value)) {
        err = Err.invalid({
            message: 'Command configuration ' + type + ' "' + name + '" expected ' + expected,
            received: value
        });
    }
    if (err && throwErr) throw err;
    return err;
}

function processProperty(map, name, defaultValue, expected, validate, throwErr) {
    return processItem('property', map, name, defaultValue, expected, validate, throwErr);
}

function processOption(map, name, defaultValue, expected, validate, throwErr) {
    return processItem('option', map, name, defaultValue, expected, validate, throwErr);
}