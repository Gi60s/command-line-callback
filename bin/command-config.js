var is              = require('./is-type');

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
        if (option.hasOwnProperty('alias') && option.alias) result[option.alias] = name;
    });
    return result;
};

exports.defaultTransform = function (v) {
    return v;
};

exports.defaultValidator = function () {
    return true
};

/**
 * Check to see if an object has already been normalized.
 * @param {object} obj
 */
exports.isNormalized = function(obj) {
    return obj.__normalized;
};

/**
 * Normalize and validate a command configuration.
 * @param {object} configuration
 * @returns {object}
 */
exports.normalize = function(configuration) {
    var result = configuration;
    var order;

    if (!is.plainObject(configuration)) throw new Error('Invalid configuration. It must be an object. Received: ' + configuration);
    if (!exports.isNormalized(configuration)) {
        result = Object.assign({}, configuration);
        processProperty(result, 'description', '', 'a string', is.string);
        processProperty(result, 'defaultOption', '', 'a string', is.string);
        processProperty(result, 'examples', [], 'an array of objects like { title: "foo", body: "bar" }', is.arrayOfSections);
        processProperty(result, 'groups', {}, 'an object mapping group names to string labels', is.objectStringMap);
        processProperty(result, 'help', '', 'a string', is.string);
        processProperty(result, 'options', {}, 'a plain object', is.object);
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

    if (!is.plainObject(option)) throw new Error('Invalid configuration option. It must be an object. Received: ' + configuration);
    if (!exports.isNormalized(option)) {
        result = Object.assign({}, option);
        processOption(result, 'alias', '', 'a string of length 1', is.alias);
        processOption(result, 'description', '', 'a string', is.string);
        processOption(result, 'group', '', 'a string', is.string);
        processOption(result, 'help', '', 'a string', is.string);
        processOption(result, 'multiple', false, 'a boolean', is.boolean);
        processOption(result, 'required', false, 'a boolean', is.boolean);
        processOption(result, 'transform', exports.defaultTransform, 'a function', is.function);
        processOption(result, 'type', Boolean, 'a function with a defined command line arg parser', is.parserFunction);
        processOption(result, 'validator', exports.defaultValidator, 'a function', is.function);

        if (result.required && result.hasOwnProperty('defaultValue')) {
            throw new Error('Command configuration option cannot have required as true and a default value because they are mutually exclusive');
        } else if (!result.required && result.hasOwnProperty('defaultValue') && !result.validator(result.defaultValue)) {
            throw new Error('Command configuration option defaultValue does not pass validator.');
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
        throw new Error('Command configuration options must be an object map. Received: ' + options);
    }

    if (!exports.isNormalized(options)) {
        result = {};
        Object.keys(options).forEach(function(name) {
            result[name] = exports.normalizeOption(options[name]);
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

function processItem(type, map, name, defaultValue, expected, validator, throwErr) {
    var err;
    var value;
    if (typeof throwErr === 'undefined') throwErr = true;
    if (!map.hasOwnProperty(name)) map[name] = defaultValue;
    value = map[name];
    if (!validator(value)) {
        err = new Error('Command configuration ' + type + ' "' + name + '" expected ' + expected + '. Received: ' + value);
    }
    if (err && throwErr) throw err;
    return err;
}

function processProperty(map, name, defaultValue, expected, validator, throwErr) {
    return processItem('property', map, name, defaultValue, expected, validator, throwErr);
}

function processOption(map, name, defaultValue, expected, validator, throwErr) {
    return processItem('option', map, name, defaultValue, expected, validator, throwErr);
}