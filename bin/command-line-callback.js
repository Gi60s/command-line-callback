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
    var item;
    var result = '';

    //generic help
    if (command === '--help' || !commandStore.hasOwnProperty(command)) {
        result += commandHelp(command);

    } else {
        item = commandStore[command];
        try {
            config = commandLineArgs.options(item.configuration, args);
            if (config.help) result += commandHelp(command);
            result += exports.execute(command, config);
        } catch (e) {
            if (e instanceof OptionError) {
                result += format.wrap(chalk.red(e.message)) + '\n\n';
                result += exports.getUsage(item.configuration);
            } else {
                throw e;
            }
        }
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
    var item;
    var config;
    var errors = [];

    //validate that command exists
    if (!commandStore.hasOwnProperty(command)) {
        throw new Error('Cannot execute command "' + command + '" because it is not defined.');
    }

    //get command and normalize options
    item = commandStore[command];
    config = commandOptions.normalize(item.configuration.options, options, errors);

    //if there are errors normalizing options then throw them now
    if (errors.length > 0) {
        throw new Error('Cannot execute command "' + command +
            '" because one or more options is not valid: \n  ' +
            errors.join('\n  '));
    }

    //execute the command
    return item.callback(config);
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
            commands.forEach(function(commandName, index) {
                var description = commandStore[commandName].configuration.description;
                body += helpFormatter('item-description', { title: commandName, body: description });
            });
        }
        result += helpFormatter.section('Commands', body);

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


function argumentHelp(command, errors) {
    var options = commandStore[command].configuration.options;
    var result = '';

    result += format.wrap(bu('Argument Errors')) + '\n\n';
    result += format.wrap('One or more of the arguments did not fit the command criteria:', { paddingLeft: '  ' }) + '\n\n';

    Object.keys(errors).forEach(function(name) {
        var arg = (options[name].alias ? b('-' + options[name].alias) + ', ' : '') + b('--' + name);
        var body;
        var error;
        var option = options[name];
        var type = errors[name];

        switch(type) {
            case 'required':
                error = chalk.red('Required');
                break;
            case 'invalid':
                error = chalk.red('Failed validation');
                break;
        }

        if (option.description) body = option.description;
        if (option.help) body += '\n' + option.help;

        result += format.columns(arg, error, body, { width: [15, 15, null], paddingLeft: '  ' });
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

    if (!command || !commandStore.hasOwnProperty(command)) {

        //if a command was issued then output that the command doesn't exist
        if (command) result += format.wrap(chalk.red('The issued command does not exist.')) + '\n\n';

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
        result += helpFormatter('default', config);
    }

    return result;
}

/*function generateCommandHelp(command, config) {
    var application = exports.application;
    var keys;
    var groups;
    var result = '';
    var str;

    //command title, description, and help
    str = config.description || '';
    if (str.length > 0 && config.help && config.help.length > 0) str += '\n\n' + config.help;
    result += helpSection(
            application + ' ' + command,
            str || chalk.italic('No description')) +
        '\n\n';

    //synopsis
    if (config.synopsis) {
        result += helpSection('Synopsis', config.synopsis.join('\n')) +
            '\n\n';
    }

    //options
    if (config.options) {
        keys = Object.keys(config.options);
        groups = Object.assign({'': 'Options'}, config.groups);
        Object.keys(groups).forEach(function (group, index) {
            var first = true;
            if (index > 0) result += '\n';
            keys.forEach(function (name) {
                var argName;
                var left;
                var opt = config.options[name];
                if ((group === '' && (!opt.group || !groups[opt.group])) || opt.group === group) {
                    if (first) {
                        result += format.wrap(bu(groups[group])) + '\n\n';
                        first = false;
                    }
                    argName = (opt.alias ? b('-' + opt.alias) + ', ' : '') + b('--' + name);
                    left = format.wrap(argName, {width: 13, hangingIndent: ' '});
                    result += format.columns(left, opt.description || '', {width: [15, null], paddingLeft: '  '});
                }
            });
        });
    }

    return result;
}*/

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