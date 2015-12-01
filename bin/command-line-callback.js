var chalk               = require('chalk');
var commandLineArgs     = require('./command-line-args');
var format              = require('cli-format');
var is                  = require('./is-type.js');
var path                    = require('path');

var commandStore = {};
var typeStore = {};


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
    var command = process.argv[2];
    var args = Array.prototype.slice.call(process.argv, 3);
    var item;
    var data;
    var result = '';

    //generic help
    if (command === '--help' || !commandStore.hasOwnProperty(command)) {
        result += commandHelp();

    } else {
        item = commandStore[command];
        data = commandLineArgs.options(item.configuration.options, item.configuration.defaultOption, args);

        if (data.options.help) {
            result += commandHelp(command);

        //report errors
        } else if (data.errors) {
            result += format.wrap('One or more of the arguments did not fit the command criteria:') + '\n\n';
            result += argumentHelp(command, data.errors);

        //execute command
        } else {
            result += commandStore[command].callback(data.options);
        }
    }

    console.log(result);
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

    //lowercase the command name
    commandName = commandName.toLowerCase();

    //validate parameters
    if (!is.string(commandName) || / /.test(commandName)) throw new Error('Invalid command name specified. Expected a string without spaces, received: ' + commandName);
    if (!is.function(callback)) throw new Error('Invalid callback specified. Expected a function, received: ' + callback);
    if (configuration && !is.object(configuration)) throw new Error('Invalid configuration specified. Expected an object, received: ' + configuration);

    //validate that the command is not already defined
    if (commandStore.hasOwnProperty(commandName)) throw new Error('Cannot define command because a command with this name is already defined: ' + commandName);

    //get the configuration
    if (!configuration) configuration = {};
    if (!configuration.hasOwnProperty('options')) configuration.options = {};
    configuration.title = exports.application + ' ' + commandName;

    //if there is a synopsis then prepend application and command name to each line
    if (Array.isArray(configuration.synopsis)) {
        configuration.synopsis.forEach(function(value, index, ar) {
            ar[index] = 'node ' + exports.application + ' ' + commandName + ' ' + value;
        });
    }

    //add help to the options
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
 * Define the constructor function for types used by options.
 * @param {function} fnConstructor
 */
exports.defineType = function(fnConstructor) {
    commandLineArgs.defineConstructor(fnConstructor);
};

/**
 * Execute a defined command with the options supplied. The options will be processed
 * before being sent to the command.
 * @param {string} commandName The name of the command to execute.
 * @param {object} [options={}] The options to pass into the command.
 * @returns {*} whatever the command returns.
 */
exports.execute = function(commandName, options) {
    /*var item;
    var configOptions;

    //validate that the command name exists
    if (!commandStore.hasOwnProperty(commandName)) throw new Error('Command not defined: ' + commandName);

    //get the command options and sort by priority
    item = commandStore[commandName];
    configOptions = item.configuration.options;

    //execute callbacks for each configuration option
    item.configuration.options.forEach(function(option) {
        var optionSupplied = options.hasOwnProperty(option.name);

        //if the option is required but wasn't included then throw an error
        if (option.required && !optionSupplied) {
            throw new Error('Command "' + commandName + '" missing required option "' + option.name + '".');
        }

        //if the option has a transform function then run it
        if (optionSupplied && typeof option.transform === 'function') {
            options[option.name] = option.transform(options[option.name]);
        }
    });

    //execute the command callback
    if (options.help) {
        return exports.getUsage(commandName) + '\n' + item.callback(options);
    } else {
        return item.callback(options);
    }*/
};



/**
 * Get usage help.
 * @param {string} [commandName]
 * @returns {string}
 */
exports.getUsage = function(commandName) {
    if (!commandName || !commandStore.hasOwnProperty(commandName)) {
        return commandHelp();
    } else {
        return commandHelp(commandName);
    }
};

exports.help = exports.getUsage;

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



function argumentHelp(command, errors) {
    var options = commandStore[command].configuration.options;
    var result = '';

    Object.keys(errors).forEach(function(name) {
        var type = errors[name];
        var arg = (options[name].alias ? b('-' + options[name].alias) + ', ' : '') + b('--' + name);
        var body = '';
        var option = options[name];

        switch(type) {
            case 'required':
                body += chalk.red('Required');
                break;
            case 'validate':
                body += chalk.red('Failed validation');
                break;
        }

        if (option.description) body += '\n' + option.description;
        if (option.help) body += '\n' + option.help;

        result += format.columns(arg, body, { width: [15, null], paddingLeft: '  ' });
    });

    return result;
}

function commandHelp(command) {
    var application = exports.application;
    var config;
    var groups;
    var keys;
    var longestCommandNameLength;
    var descriptionStartColumn;
    var result = '';
    var str;

    if (!command) {

        if (!commandStore.hasOwnProperty(command)) {
            result += format.wrap(chalk.red('The issued command does not exist.')) + '\n\n';
        }

        result += helpSection(
            application,
            'This application accepts multiple commands as can be seen below in the command list.') +
            '\n\n';

        result += helpSection('Synopsis',
            application + ' [COMMAND] [OPTIONS]...') +
            '\n\n';

        keys = Object.keys(commandStore);
        result += helpSection(
            'Command Help',
            'To get help on any of the commands, type the command name followed by --help. For ' +
            'example: \n\n' + application + ' ' + keys[0] + ' --help') +
            '\n\n';

        result += format.wrap('\u001b[1;4mCommands\u001b[0m') + '\n\n';

        //determine how long the longest command name is
        longestCommandNameLength = 0;
        keys.forEach(function(commandName) {
            var len = commandName.length;
            if (longestCommandNameLength < len) longestCommandNameLength = len;
        });

        //determine the description start column
        descriptionStartColumn = longestCommandNameLength + 3;

        //start writing commands and their descriptions
        keys.forEach(function(commandName, index) {
            var cmd = commandStore[commandName];
            result += format.columns(chalk.bold(commandName), cmd.configuration.description || '', { width: [descriptionStartColumn, null], paddingLeft: '  ' });
        });

    } else {
        config = commandStore[command].configuration;

        str = config.description;
        if (str.length > 0 && config.help.length > 0) str += '\n\n' + config.help;
        result += helpSection(
            application + ' ' + command,
            str || chalk.italic('No description')) +
            '\n\n';

        if (config.synopsis) {
            result += helpSection('Synopsis', config.synopsis.join('\n')) +
                '\n\n';
        }

        //options
        keys = Object.keys(config.options);
        groups = Object.assign({ '': 'Options' }, config.groups);
        Object.keys(groups).forEach(function(group, index) {
            var first = true;
            if (index > 0) result += '\n';
            keys.forEach(function(name) {
                var argName;
                var left;
                var opt = config.options[name];
                if ((group === '' && (!opt.group || !groups[opt.group])) || opt.group === group) {
                    if (first) {
                        result += format.wrap(bu(groups[group])) + '\n\n';
                        first = false;
                    }
                    argName = (opt.alias ? b('-' + opt.alias) + ', ' : '') + b('--' + name);
                    left = format.wrap(argName, { width: 13, hangingIndent: ' ' });
                    result += format.columns(left, opt.description || '', { width: [15, null], paddingLeft: '  ' });
                }
            });
        });
    }

    return result;
}

function b(str) {
    return '\u001b[1m' + str + '\u001b[0m';
}

function bu(str) {
    return '\u001b[1;4m' + str + '\u001b[0m';
}

function helpSection(title, content, width) {
    return format.wrap(bu(title)) + '\n\n' +
        format.wrap(content, { paddingLeft: '  '});
}