var chalk               = require('chalk');
var commandConfig       = require('./command-config');
var commandLineArgs     = require('./command-line-args');
var commandOptions      = require('./command-options');
var format              = require('cli-format');
var help                = require('./help');
var helpTemplate        = require('./help-template');
var is                  = require('./is-type.js');
var path                = require('path');

var commandStore = {};


Object.defineProperty(exports, 'application', {
    get: function() {
        return path.basename(process.argv[1], '.js');
    }
});

/**
 * Evaluate the command line args that were used to start the application and call the
 * associated command. Any output will be sent to the console.
 */
exports.evaluate = function() {
    var args = Array.prototype.slice.call(process.argv, 3);
    var command = process.argv[2];
    var config;
    var error;
    var execResult;
    var item;
    var normalizedOptions;
    var result = '';

    // get command list help
    if (command === '--help' || !command) {
        result += helpTemplate.commandList(exports.application, commandStore);
        console.log(result);

    // invalid command
    } else if (!commandStore.hasOwnProperty(command)) {
        result += format.wrap(chalk.red('The issued command does not exist.')) + '\n\n';
        result += helpTemplate.commandList(exports.application, commandStore);
        console.log(result);

    // valid command
    } else {
        item = commandStore[command];

        //evaluate command line arguments
        normalizedOptions = commandLineArgs.options(item.configuration, args, false);
        config = normalizedOptions.options;
        error = createExecuteError(command, normalizedOptions.errors);

        //execute the command
        execResult = item.callback(error, config);

        //show help
        if (error && !config.help) result += format.wrap(chalk.red(error.message)) + '\n\n';
        if (error || config.help) result += exports.getCommandUsage(command) + '\n';

        if (isPromise(execResult)) {
            execResult.then(function(data) {
                if (typeof data !== 'undefined') result += data;
                console.log(result || '');
            }, function(err) {
                console.error(result + (err.stack || err));
            });
        } else {
            if (typeof execResult !== 'undefined') result += execResult;
            console.log(result || '');
        }
    }
};

/**
 * Define a command that should be accessible from the command line by using the
 * specified command name.
 * @param {string} commandName The name of the command as it will be called from the command line.
 * @param {function} callback The function to call to execute the command. This function will receive
 * one parameter, an object, that has all of the options that were passed in with their processed values.
 * @param {object} [configuration={ options: {} }] An object defining how the command works and what options are
 * available to it. If this parameter is omitted then your command will not have any options
 * available to it.
 */
exports.define = function(commandName, callback, configuration) {
    var config;

    //lowercase the command name
    commandName = commandName.toLowerCase();

    //validate parameters
    if (!is.string(commandName) || / /.test(commandName)) throw new Error('Invalid command name specified. Expected a string without spaces, received: ' + commandName);
    if (!is.function(callback)) throw new Error('Invalid callback specified. Expected a function, received: ' + callback);
    if (!is.plainObject(configuration)) throw new Error('Invalid configuration specified. Expected an object, received: ' + configuration);

    //validate that the command is not already defined
    if (commandStore.hasOwnProperty(commandName)) throw new Error('Cannot define command because a command with this name is already defined: ' + commandName);

    //normalize the configuration
    config = commandConfig.normalize(configuration);
    configuration.title = exports.application + ' ' + commandName;

    //add help to the options
    if (!configuration.hasOwnProperty('options')) configuration.options = {};
    if (!configuration.options.hasOwnProperty('help')) {
        configuration.options.help = {
            type: Boolean,
            description: 'Get usage details about this command.'
        }
    }

    //store the command
    commandStore[commandName] = {
        command: commandName,
        callback: callback,
        configuration: configuration || {}
    };
};

/**
 * Execute a defined command with the options supplied. The options will be processed
 * before being sent to the command.
 * @param {string} command The name of the command to execute.
 * @param {object} [options={}] The options to pass into the command.
 * @returns {*} whatever the command returns.
 */
exports.execute = function(command, options) {
    var config;
    var error;
    var item;
    var normalizedOptions;

    //validate that command exists
    if (!commandStore.hasOwnProperty(command)) {
        throw new Error('Cannot execute command "' + command + '" because it is not defined.');
    }

    //get command and normalize options
    item = commandStore[command];
    normalizedOptions = commandOptions.normalize(item.configuration.options, options, false);
    config = normalizedOptions.options;
    error = createExecuteError(normalizedOptions.errors);

    //execute the command
    return item.callback(error, config);
};



/**
 * Get usage help.
 * @param {string} command The name of the command to get usage information for.
 * @returns {string}
 */
exports.getCommandUsage = function(command) {
    var config = commandConfig.normalize(commandStore[command].configuration);
    return helpTemplate.command(exports.application, command, config);
};

/**
 * Get a list of defined commands, optionally limited to only non-aliases.
 * @param {boolean} [commandsOnly=false] Set to true to not return aliases in the result set.
 * @returns {string[]}
 */
exports.list = function(commandsOnly) {
    var results = [];
    Object.keys(commandStore).forEach(function(name) {
        var item = commandStore[name];
        if (!commandsOnly || item.command === name) results.push(name);
    });
    return results;
};





function createExecuteError(command, errors) {
    if (errors.length === 0) return null;
    return new Error('Cannot execute command "' + command +
        '" because one or more options are not valid: \n  ' +
        errors.join('\n  '))
}

function isPromise(value) {
    return value && typeof value.then === 'function';
}