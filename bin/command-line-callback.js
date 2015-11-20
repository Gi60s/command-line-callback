var commandLineArgs         = require('command-line-args');
var CommandLineError        = require('./command-line-error');
var is                      = require('./is-type');
var path                    = require('path');
var wordWrap                = require('./word-wrap');

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
    var command = process.argv[2];
    var args = Array.prototype.slice.call(process.argv, 3);
    var item;
    var options;

    if (command === '--help' || !commandStore.hasOwnProperty(command)) {
        console.log(commandHelp());
    } else {
        item = commandStore[command];
        options = commandLineArgs(item.configuration.options).parse(args);
        try {
            console.log(exports.execute(command, options));
        } catch (e) {
            if (e instanceof CommandLineError) {
                console.error(e.message);
                console.log(exports.getUsage(command));
            } else {
                console.error(e.stack);
            }
        }
    }
};

/**
 * Define a command that should be accessible from the command line by using the
 * specified command name.
 * @param {string} commandName The name of the command as it will be called from the command line.
 * @param {function} callback The function to call to execute the command. This function will receive
 * one parameter, an object, that has all of the options that were passed in with their processed values.
 * @param {object} [configuration={}] An object defining how the command works and what options are
 * available to it. If this parameter is omitted then your command will not have any options
 * available to it.
 */
exports.define = function(commandName, callback, configuration) {
    var cb;
    var found;
    var i;
    var option;

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
    if (!configuration.hasOwnProperty('options')) configuration.options = [];
    configuration.title = exports.application + ' ' + commandName;

    //if there is a synopsis then prepend application and command name to each line
    if (Array.isArray(configuration.synopsis)) {
        configuration.synopsis.forEach(function(value, index, ar) {
            ar[index] = 'node ' + exports.application + ' ' + commandName + ' ' + value;
        });
    }

    //add help to the options
    for (i = 0; i < configuration.options.length; i++) {
        option = configuration.options[i];
        if (option.name === 'help') {
            found = true;
            break;
        }
    }
    if (!found) {
        configuration.options.push({
            name: 'help',
            description: 'Get usage details about this command'
        });
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
 * @param {string} commandName The name of the command to execute.
 * @param {object} [options={}] The options to pass into the command.
 * @returns {*} whatever the command returns.
 */
exports.execute = function(commandName, options) {
    var item;
    var configOptions;

    //validate that the command name exists
    if (!commandStore.hasOwnProperty(commandName)) throw new CommandLineError('Command not defined: ' + commandName);

    //get the command options and sort by priority
    item = commandStore[commandName];
    configOptions = item.configuration.options.slice();

    //execute callbacks for each configuration option
    item.configuration.options.forEach(function(option) {
        var optionSupplied = options.hasOwnProperty(option.name);

        //if the option is required but wasn't included then throw an error
        if (option.required && !optionSupplied) {
            throw new CommandLineError('Command "' + commandName + '" missing required option "' + option.name + '".');
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
    }
};

/**
 * Get usage help.
 * @param {string} [commandName]
 * @returns {string}
 */
exports.getUsage = function(commandName) {
    var item;
    var result;
    if (!commandName || !commandStore.hasOwnProperty(commandName)) {
        return commandHelp();
    } else {
        item = commandStore[commandName];
        return commandLineArgs(item.configuration.options).getUsage(item.configuration);
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








function commandHelp() {
    var application = exports.application;
    var keys = Object.keys(commandStore);
    var longestCommandNameLength;
    var descriptionStartColumn;
    var result;

    //if there are no defined commands then return that message
    if (keys.length === 0) return 'There are no defined commands';

    //initialize the result
    result =
        wordWrap(
            wordWrap.boldUnderline(application) + '\n\n' +
            'This application accepts multiple commands as can be seen below in the command list.',
            { hangingLineIndent: 2 }
        ) +
        '\n\n' +
        wordWrap(
            wordWrap.boldUnderline('Synopsis') + '\n\n' +
            application + ' [COMMAND] [OPTIONS]...',
            { hangingLineIndent: 2 }
        ) +
        '\n\n' +
        wordWrap(
            wordWrap.boldUnderline('Command Help') + '\n\n' +
            'To get help on any of the commands, type the command name followed by --help. For ' +
            'example: \n\n' + application + ' ' + keys[0] + ' --help',
            { hangingLineIndent: 2 }
        ) +
        '\n\n' +
        wordWrap(
            wordWrap.boldUnderline('Commands'),
            { hangingLineIndent: 2 }
        ) +
        '\n\n';

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
        var content;
        content = '  ' + wordWrap.bold(commandName) + wordWrap.makeSpaces(descriptionStartColumn - commandName.length);
        content += (cmd.configuration.description || '');
        result += wordWrap(content, { hangingLineIndent: descriptionStartColumn + 2 }) + '\n';
    });

    return result;
}



