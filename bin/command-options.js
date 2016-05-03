var commandConfig           = require('./command-config');
var CustomError             = require('custom-error-instance');
var envfile                 = require('envfile');
var path                    = require('path');

var OptionError = CustomError('OptionError');



/**
 * Get an object with validated and normalized options from a values map.
 * @param {object} optionsConfiguration
 * @param {object} valuesMap
 * @param {boolean} [optionsOnly=true] Set to false to have the returned value be an object with option and error properties.
 * @returns {object}
 */
exports.normalize = function(optionsConfiguration, valuesMap, optionsOnly) {
    var config = commandConfig.normalizeOptions(optionsConfiguration);
    var envFilePath;
    var envFileObj = {};
    var errors = [];
    var message;
    var result = {};
    var settings = require('./command-line-callback').settings;
    optionsOnly = typeof optionsOnly === 'undefined' ? true : !!optionsOnly;
    valuesMap = Object.assign({}, valuesMap);

    //load and parse the env file
    if (optionsConfiguration.hasOwnProperty('envFile') && settings.envFileOption) {
        envFilePath = valuesMap.envFile;
        if (typeof envFilePath === 'undefined' && optionsConfiguration.envFile.hasOwnProperty('defaultValue')) envFilePath = optionsConfiguration.envFile.defaultValue;
        if (envFilePath) envFileObj = envfile.parseFileSync(path.resolve(process.cwd(), envFilePath));
    }

    //merge environment variables and default values with values map
    Object.keys(config).forEach(function(name) {
        var c = config[name];
        if (!valuesMap.hasOwnProperty(name)) {
            if (c.hasOwnProperty('env') && envFileObj.hasOwnProperty(c.env)) {
                valuesMap[name] = c.multiple ? [ envFileObj[c.env] ] : envFileObj[c.env];
            } else if (c.hasOwnProperty('env') && c.env && process.env[c.env]) {
                valuesMap[name] = c.multiple ? [ process.env[c.env] ] : process.env[c.env];
            } else if (c.hasOwnProperty('defaultValue')) {
                valuesMap[name] = c.multiple ? [ c.defaultValue ] : c.defaultValue;
            }
        }
    });

    //find required errors
    exports.missingRequires(config, valuesMap).forEach(function(name) {
        errors.push('Missing required option: ' + name);
    });

    //normalize each value
    Object.keys(valuesMap).forEach(function(name) {
        try {
            if (config.hasOwnProperty(name)) {
                result[name] = exports.normalizeValue(config[name], valuesMap[name], name);
            }
        } catch (e) {
            if (e instanceof OptionError) {
                errors.push(e.message);
            } else {
                throw e;
            }
        }
    });

    //camel case properties
    //result = exports.camelCase(result);

    //throw all errors in one
    if (optionsOnly && errors.length > 0) {
        message = 'One or more errors occurred while building a configuration from a value map: \n  ' + errors.join('\n  ');
        throw new OptionError(message);
    }

    return optionsOnly ? result : { options: result, errors: errors };
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
        if (config[name].required && !valuesMap.hasOwnProperty(name) && !process.env[config[name].env]) requires.push(name);
    });
    return requires;
};

/**
 * Get an array with the names of any required options that do not have values.
 * @param {object} optionConfiguration
 * @param {object} value
 * @param {string} [name] The name of the option. Used for error reporting.
 * @returns {Array}
 */
exports.normalizeValue = function(optionConfiguration, value, name) {
    var config = commandConfig.normalizeOption(optionConfiguration);
    var errName = name ? ' for option: ' + name : '';
    var isArray = Array.isArray(value);
    var result;

    function normalize(value) {
        if (!config.validate(value)) throw new OptionError('Option validation failed' + errName + ' with value: ' + value);
        value = config.transform(value);
        return value;
    }

    if (config.multiple) {
        if (!isArray) throw new OptionError('Invalid option value' + errName + '. Expected an array. Received: ' + value);
        result = value.map(normalize);
    } else {
        if (isArray && config.type !== Array) throw new OptionError('Invalid option value' + errName + '. Did not expect an array.');
        result = normalize(value);
    }

    return result;
};