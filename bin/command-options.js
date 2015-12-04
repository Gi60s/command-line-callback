var commandConfig           = require('./command-config');

/**
 * Get an object with validated and normalized options from a values map.
 * @param {object} optionsConfiguration
 * @param {object} valuesMap
 * @param {Array} [errors] An array to store errors into. If omitted then error will be thrown if encountered.
 * @returns {object}
 */
exports.normalize = function(optionsConfiguration, valuesMap, errors) {
    var config = commandConfig.normalizeOptions(optionsConfiguration);
    var result = {};
    valuesMap = Object.assign({}, valuesMap);

    //find required errors
    exports.missingRequires(config, valuesMap).forEach(function(name) {
        reportError(errors, 'Missing required option: ' + name);
    });

    //merge default values with values map
    Object.keys(config).forEach(function(name) {
        var c = config[name];
        if (!valuesMap.hasOwnProperty(name) && c.hasOwnProperty('defaultValue')) {
            valuesMap[name] = c.multiple ? [ c.defaultValue ] : c.defaultValue;
        }
    });

    //normalize each value
    Object.keys(valuesMap).forEach(function(name) {
        result[name] = exports.normalizeValue(config, valuesMap[name], errors);
    });

    return result;
};

/**
 * Get an array with the names of any required options that do not have values.
 * @param {object} optionsConfiguration
 * @param {object} valuesMap
 * @returns {Array}
 */
exports.missingRequires = function(optionsConfiguration, valuesMap) {
    var config = commandConfig.normalize(optionsConfiguration);
    var requires = [];
    Object.keys(config).forEach(function(name) {
        if (config[name].required && !valuesMap.hasOwnProperty(name)) requires.push(name);
    });
    return requires;
};

/**
 * Get an array with the names of any required options that do not have values.
 * @param {object} optionConfiguration
 * @param {object} value
 * @param {string} [name] The name of the option. Used for error reporting.
 * @param {Array} [errors] An array to store errors into. If omitted then error will be thrown if encountered.
 * @returns {Array}
 */
exports.normalizeValue = function(optionConfiguration, value, name, errors) {
    var config = commandConfig.normalizeOption(optionConfiguration);
    var errName = name ? ' for option: ' + name : '';
    var isArray = Array.isArray(value);
    var result;

    function normalize(value) {
        value = config.transform(value);
        if (!config.validator(value)) reportError(errors, 'Option validation failed' + errName + '.');
    }

    if (config.multiple) {
        if (!isArray) throw new Error('Invalid option value' + errName + '. Expected an array. Received: ' + value);
        result = value.map(normalize);
    } else {
        if (isArray && config.type !== Array) throw new Error('Invalid option value' + errName + '. Did not expect an array.');
        result = normalize(value);
    }

    return result;
};



function reportError(store, message) {
    if (Array.isArray(store)) {
        store.push(message);
    } else {
        throw new Error(message);
    }
}