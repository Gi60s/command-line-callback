var chalk               = require('chalk');
var commandConfig       = require('./command-config');
var commandLineArgs     = require('./command-line-args');
var commandOptions      = require('./command-options');
var format              = require('cli-format');
var helpFormatter       = require('./help-formatter');
var is                  = require('./is-type.js');
var OptionError         = require('./option-error');
var path                = require('path');

var commandStore = {};


Object.defineProperty(exports, 'application', {
    get: function() {
        return path.basename(process.argv[1]);
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

    //generic help
    if (command === '--help' || !commandStore.hasOwnProperty(command)) {
        result += exports.getCommandUsage(command);

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

        //add command results to the output
        if (typeof execResult !== 'undefined') result += execResult;
    }

    console.log(result || '');
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
    if (configuration && !is.plainObject(configuration)) throw new Error('Invalid configuration specified. Expected an object, received: ' + configuration);

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
 * @param {string} [command] The command to get usage for.
 * @param {object} [configuration] If provided then usage is generated based on this
 * configuration whether the command exists or not.
 * @param {string} [template] The help formatter template to use to produce the usage.
 * @returns {string}
 */
exports.getUsage = function(configuration, template) {
    var config = commandConfig.normalize(configuration);
    if (!template) template = helpFormatter.defaultTemplate;
    return helpFormatter(template, config);
};

exports.getCommandUsage = function(command, template) {
    var application = exports.application;
    var body;
    var commands;
    var result;
    var widestCommand;

    if (!template) template = helpFormatter.defaultTemplate;

    if (!command || !commandStore.hasOwnProperty(command)) {
        commands = Object.keys(commandStore);

        if (command) result += format.wrap(chalk.red('The issued command does not exist.')) + '\n\n';

        result = helpFormatter.section(application,
                'This application accepts multiple commands as can be seen below in the command list.') + '\n\n';

        result += helpFormatter('synopsis', { title: application, synopsis: [ '[COMMAND] [OPTIONS]...']}) + '\n\n';

        result += helpFormatter.section(
                'Command Help',
                'To get help on any of the commands, type the command name followed by --help.' +
                (commands.length > 0 ? ' For example: \n\n' + application + ' ' + commands[0] + ' --help' : '')) + '\n\n';

        if (commands.length === 0) {
            body = chalk.italic('No commands are defined.');
        } else {
            body = '';
            widestCommand = commands.reduce(function(prev, curr) { return prev > curr.length ? prev : curr.length; }, 0);
            commands.forEach(function(commandName, index) {
                var description = commandStore[commandName].configuration.description;
                body += helpFormatter('item-description', { title: chalk.bold(commandName), body: description, width: widestCommand }) + '\n';
            });
        }
        result += helpFormatter.ansi.boldUnderline('Commands') + '\n\n' + body;

    } else {
        result = exports.getUsage(commandStore[command].configuration, template);
    }

    return result;
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
        '" because one or more options is not valid: \n  ' +
        errors.join('\n  '))
}