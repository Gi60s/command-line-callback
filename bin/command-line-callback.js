var chalk               = require('chalk');
var commandConfig       = require('./command-config');
var commandLineArgs     = require('./command-line-args');
var commandOptions      = require('./command-options');
var format              = require('cli-format');
var help                = require('./help');
var helpTemplate        = require('./help-template');
var is                  = require('./is-type.js');
var path                = require('path');

var defaultCommand = 'default';
var commandStore = {};

Object.defineProperty(exports, 'application', {
    enumerable: false,
    configurable: true,
    writable: false,
    value: path.basename(process.argv[1], '.js')
});

/**
 * Get or set the default command to use if one is not specified.
 */
Object.defineProperty(exports, 'defaultCommand', {
    enumerable: true,
    configurable: true,
    get: function() { return defaultCommand; },
    set: function(v) { defaultCommand = v; }
});

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
    
    //lowercase the command name
    commandName = commandName.toLowerCase();

    //validate parameters
    if (!is.string(commandName) || / /.test(commandName)) throw new Error('Invalid command name specified. Expected a string without spaces, received: ' + commandName);
    if (!is.function(callback)) throw new Error('Invalid callback specified. Expected a function, received: ' + callback);
    if (!is.plainObject(configuration)) throw new Error('Invalid configuration specified. Expected an object, received: ' + configuration);

    //validate that the command is not already defined
    if (commandStore.hasOwnProperty(commandName)) throw new Error('Cannot define command because a command with this name is already defined: ' + commandName);

    //normalize the configuration (for validation)
    commandConfig.normalize(configuration);
    configuration.title = exports.application + ' ' + commandName;

    //make sure that the options property exists in the configuration
    if (!configuration.hasOwnProperty('options')) configuration.options = {};

    //add help to the options
    if (!configuration.options.hasOwnProperty('help')) {
        configuration.options.help = {
            type: Boolean,
            description: 'Get usage details about this command.',
            defaultValue: false
        };
    }

    //add the env file option
    if (!configuration.options.hasOwnProperty('envFile')) {
        configuration.options.envFile = {
            type: String,
            description: 'The file path to an environment configuration file that is used to populate environment variables.'
        };
    }

    //store the command
    commandStore[commandName] = {
        command: commandName,
        callback: callback,
        configuration: configuration || {}
    };
};

/**
 * Evaluate the command line args that were used to start the application and call the
 * associated command. Any output will be sent to the console.
 */
exports.evaluate = function(args) {
    var command;
    var commands = Object.keys(commandStore);
    var config;
    var error;
    var execResult;
    var item;
    var normalizedOptions;
    var result = '';

    // if args is not defined then use process args
    if (!args) args = Array.prototype.slice.call(process.argv, 2);

    // check to see if the first argument is a valid command and if so then pull it off of the args list
    if (commandStore.hasOwnProperty(args[0])) command = args.shift();

    // if no command was specified and there is only one command then use just that command
    if (!command && commands.length === 1) command = commands[0];

    // if a command wasn't specified, check for a default command
    if (typeof command === 'undefined' && args[0] !== '--help' && commandStore.hasOwnProperty(defaultCommand)) command = defaultCommand;

    // get command list help
    if (typeof command === 'undefined') {
        result += exports.getCommandUsage();
        console.log(result);

    // invalid command
    } else if (!commandStore.hasOwnProperty(command)) {
        result += format.wrap(chalk.red('The issued command does not exist.')) + '\n\n';
        result += result += exports.getCommandUsage();
        console.log(result);

    // valid command
    } else {
        item = commandStore[command];

        //evaluate command line arguments
        normalizedOptions = commandLineArgs.options(item.configuration, args, false);
        config = normalizedOptions.options;
        error = createExecuteError(command, normalizedOptions.errors);

        //show help
        if (error && !config.help) result += format.wrap(chalk.red(error.message)) + '\n\n';
        if (error || config.help) {
            result += exports.getCommandUsage(command) + '\n';
            console.log(result);
            return;
        }

        //execute the command
        execResult = item.callback(config);

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

    error = createExecuteError(command, normalizedOptions.errors);
    if (error) throw error;

    //execute the command
    return item.callback(config);
};



/**
 * Get usage help.
 * @param {string} [command] The name of the command to get usage information for.
 * @returns {string}
 */
exports.getCommandUsage = function(command) {
    var config;
    if (arguments.length === 0) {
        return helpTemplate.commandList(exports.application, commandStore);
    } else {
        config = commandConfig.normalize(commandStore[command].configuration);
        return helpTemplate.command(commandStore, exports.application, command, config);
    }
};

/**
 * Get a list of defined commands.
 * @returns {string[]}
 */
exports.list = function() {
    return Object.keys(commandStore);
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