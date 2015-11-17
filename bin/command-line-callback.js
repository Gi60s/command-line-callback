var commandLineArgs         = require('command-line-args');
var is                      = require('./is-type');
var path                    = require('path');
var wordWrap                = require('./word-wrap');

var commandStore = {};

exports.evaluate = function() {
    var nodeProcessPath = process.argv[0];
    var application = path.basename(process.argv[1]);
    var command = process.argv[2];
    var args = Array.prototype.slice.call(process.argv, 3);
    var item;
    var options;

    if (!commandStore.hasOwnProperty(command)) {
        console.log(commandHelp(application));
    } else {
        item = commandStore[command];
        options = commandLineArgs(item.configuration.options).parse(args);
        exports.execute(command, options);
    }
};

exports.define = function(commandName, callback, configuration) {
    var aliases;
    var cb;
    var found;
    var i;
    var option;

    function help(value) {
        console.log(exports.getUsage(commandName));
        if (cb) cb(value);
    }

    //validate parameters
    if (!is.string(commandName)) throw new Error('Invalid command name specified. Expected a string, received: ' + commandName);
    if (!is.function(callback)) throw new Error('Invalid callback specified. Expected a function, received: ' + callback);
    if (configuration && !is.object(configuration)) throw new Error('Invalid configuration specified. Expected an object, received: ' + configuration);

    //validate that the command is not already defined
    if (commandStore.hasOwnProperty(commandName)) throw new Error('Cannot define command because a command with this name is already defined: ' + commandName);

    //get unique aliases
    aliases = configuration.alias || [];
    if (!Array.isArray(aliases)) aliases = [ aliases ];
    aliases = arrayFilterUnique(aliases);

    //get te configuration
    if (!configuration) configuration = {};
    if (!configuration.hasOwnProperty('options')) configuration.options = [];

    //add help to the options
    for (i = 0; i < configuration.options.length; i++) {
        option = configuration.options[i];
        if (option.name === 'help') {
            found = true;
            if (option.callback === 'function') cb = option.callback;
            option.callback = help;
            break;
        }
    }
    if (!found) {
        configuration.options.push({
            name: 'help',
            description: 'Get usage details about this command',
            callback: help
        });
    }

    //validate each alias that it is not already in use
    aliases.forEach(function(alias) {
        if (commandStore.hasOwnProperty(alias)) throw new Error('Command "' + commandName + '" cannot have the alias "' + alias + '" because it is in use by the command "' + commandStore[alias].command);
    });

    //store the command
    commandStore[commandName] = {
        command: commandName,
        callback: callback,
        configuration: configuration || {}
    };

    //if the command has aliases then link them to the command
    aliases.forEach(function(alias) {
        commandStore[alias] = commandStore[commandName];
    });
};

exports.execute = function(commandName, options) {
    var item;
    var configOptions;
    var result;

    //validate that the command name exists
    if (!commandStore.hasOwnProperty(commandName)) throw new Error('Command not defined: ' + commandName);

    //get the command options and sort by priority
    item = commandStore[commandName];
    configOptions = item.configuration.options.slice();
    configOptions.sort(function(a, b) {
        var p1 = a.priority || 0;
        var p2 = b.priority || 0;
        return p1 - p2;
    });

    //execute callbacks for each configuration option
    configOptions.forEach(function(option) {
        if (options.hasOwnProperty(option.name) && typeof option.callback === 'function') {
            result = option.callback(options[option.name]);
            if (typeof result !== 'undefined') options[option.name] = result;
        }
    });

    //execute the command callback
    item.callback(options);
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








function arrayFilterUnique(arr) {
    var result = [];
    arr.forEach(function(item) {
        var index = result.indexOf(item);
        if (index === -1) result.push(item);
    });
    return result;
}

function commandHelp(application) {
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
            '  ' + application + ' [COMMAND] [OPTIONS]...',
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
        if (cmd.command !== commandName) {
            content += '(Alias: see ' + wordWrap.italic(cmd.command) + ')'
        } else {
            content += (cmd.configuration.description || '');
        }
        result += wordWrap(content, { hangingLineIndent: descriptionStartColumn + 2 }) + '\n';
    });

    return result;
}



