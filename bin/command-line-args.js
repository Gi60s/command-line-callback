var argParser               = require('./arg-parser');
var commandConfig           = require('./command-config');
var commandOptions          = require('./command-options');

/**
 * Get the input arguments.
 */
Object.defineProperty(exports, 'args', {
    get: function() {
        return Array.prototype.slice.call(process.argv, 3);
    }
});

/**
 * Get the name of the command specified from the input arguments.
 */
Object.defineProperty(exports, 'command', {
    get: function() {
        return process.argv[2];
    }
});

/**
 * Generate a values map from the command line arguments.
 * @param {string} defaultOption
 * @param {string[]} args
 * @returns {object}
 */
exports.map = function(defaultOption, args) {
    var ar;
    var arg;
    var current;
    var i;
    var map = {};

    function create(name) {
        if (!map.hasOwnProperty(name)) map[name] = [];
        current = name;
    }

    function append(value) {
        if (!current && defaultOption) {
            if (!map.hasOwnProperty(defaultOption)) map[defaultOption] = [];
            map[defaultOption].push(value);
        } else {
            map[current].push(value);
        }
        current = false;
    }

    if (!args) args = exports.args;

    for (i = 0; i < args.length; i++) {
        arg = args[i];

        if (/=/.test(arg)) {
            ar = arg.split('=');
            arg = ar[0];
            args.splice(i + 1, 0, ar[1]);
        }

        if (/^-[a-z]/i.test(arg)) {
            arg = arg.substr(1).split('');
            arg.forEach(create);

        } else if (/^--[a-z]/i.test(arg)) {
            create(arg.substr(2));

        } else {
            append(arg);
        }
    }

    return map;
};

/**
 * Get a normalized and validated configuration object from command line arguments.
 * @param {object} configuration The command configuration.
 * @param {string[]} args
 */
exports.options = function(configuration, args) {
    var config = commandConfig.normalize(configuration);
    var aliasMap = commandConfig.aliasMap(config.options);
    var argMap = exports.map(config.defaultOption, args);
    var data = {};
    Object.keys(argMap).forEach(function(name) {
        var values = argMap[name];
        var optConfig;
        var optName = aliasMap.hasOwnProperty(name) ? aliasMap[name] : name;

        if (config.options.hasOwnProperty(optName)) {
            optConfig = config.options[optName];

            //if the array is empty then add one undefined value
            if (values.length === 0) values[0] = void 0;

            //convert from argument string values to final representations
            values = values.map(function(value) {
                return argParser.parse(optConfig.type, value);
            });

            //if not multiple then get the last item
            if (!optConfig.multiple) values = values[values.length - 1];

            //store the value
            data[optName] = values;
        }
    });
    return commandOptions.normalize(config.options, data);
};