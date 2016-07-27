"use strict";
var chalk           = require('chalk');
var format          = require('cli-format');
var help            = require('./help');

exports.command = function(commandStore, appName, commandName, config) {
    var commands = Object.keys(commandStore);
    var result = [];

    result.push(help.section(config.title, config.brief));

    if (config.synopsis && config.synopsis.length > 0) {
        result.push(help.synopsis(commands.length > 1 ? appName + ' ' + commandName : appName, config.synopsis));
    }

    if (config.description) {
        result.push(help.section('Description', config.description));
    }

    config.sections.forEach(function(section) {
        if (section.beforeOptions) {
            result.push(help.section(section.title, section.body));
        }
    });

    if (Object.keys(config.options).length > 0) {
        result.push(exports.options(config, { app: appName, command: commandName }));
    }

    config.sections.forEach(function(section) {
        if (!section.beforeOptions) {
            result.push(help.section(section.title, section.body));
        }
    });

    return result.join('\n\n');
};

exports.commandList = function(appName, commandStore) {
    var body;
    var commands = Object.keys(commandStore);
    var result = [];
    var width;

    result.push(help.section(appName, 'The ' + chalk.bold(appName) + ' application requires a command to execute.'));

    result.push(help.synopsis(appName, ['[COMMAND] [OPTIONS]...']));

    result.push(help.section('Command Help',
            'To get help on any of the commands, type the command name followed by --help.' +
            (commands.length > 0 ? ' For example: \n\n' + appName + ' ' + commands[0] + ' --help' : '')));

    if (commands.length === 0) {
        body = chalk.italic('No commands are defined.');
    } else {
        body = [];
        width = help.width(commands, 35);
        commands.sort();
        commands.forEach(function(commandName) {
            var brief = commandStore[commandName].configuration.brief || '';
            var left;

            left = {
                content: chalk.bold(commandName),
                width: width + 2,
                paddingLeft: '  ',
                hangingIndent: '  '
            };

            body.push(help.columns([left, brief]));
        });
        body = body.join('\n\n');
    }
    result.push(help.heading('Available Commands') + body);

    return result.join('\n\n') + '\n';
};

exports.options = function(config, params) {
    var dash = '\u2010';
    var maxWidth = 35;
    var optionKeys = Object.keys(config.options);
    var groupMap;
    var groups = [];
    var result = '';
    var strWidth = format.width;
    var width = 0;

    //create a group mapping (between keys and labels)
    groupMap = Object.assign({}, config.groups);
    if (!groupMap.hasOwnProperty('')) groupMap[''] = null;

    //create a groups store
    Object.keys(groupMap).forEach(function (groupKey, index) {
        var argName;
        var argWidth;
        var found;
        var group;
        var i;
        var opt;
        var optKey;
        var optName;
        var value = groupMap[groupKey];

        group = {
            argColumnWidth: 0,
            argNames: [],
            description: value && typeof value === 'object' ? value.description : '',
            key: groupKey,
            label: value === null || typeof value === 'string' ? value : value.title,
            options: []
        };

        for (i = 0; i < optionKeys.length; i++) {
            optKey = optionKeys[i];
            optName = camelToDash(optKey);
            opt = config.options[optKey];
            if (!opt.hidden && ((groupKey === '' && (!opt.group || !groupMap[opt.group])) || opt.group === groupKey)) {
                found = true;

                group.options.push(opt);

                argName = (opt.alias ? chalk.bold(dash + opt.alias) + ', ' : '') + chalk.bold(dash + dash + optName);
                group.argNames.push(argName);

                argWidth = strWidth(argName);
                if (argWidth > maxWidth) argWidth = maxWidth;
                if (argWidth > group.argColumnWidth) group.argColumnWidth = argWidth;
                if (argWidth > width) width = argWidth;
            }
        }

        if (found) groups.push(group);
    });

    // if the misc group exists but hasn't been named then name it now
    if (groupMap[''] === null) {
        delete groupMap[''];
        groupMap[''] = groups.length > 1 ? 'Misc Options' : 'Options';
        groups.forEach(function(group) {
            if (group.key === '' && group.label === null) group.label = groupMap[''];
        });
    }

    //create the result
    groups.forEach(function(group, groupIndex) {

        //add the group header
        if (groupIndex > 0) result += '\n';
        result += group.description ? help.section(group.label, group.description) + '\n\n' : help.heading(group.label);

        group.options.forEach(function(option, optionIndex) {
            var argName = group.argNames[optionIndex];
            var body;
            var defValue;
            var left;
            var right = [];

            if (option.required) right.push(chalk.yellow('[Required]'));

            if (option.type.name && option.type.name !== 'Boolean') right.push(chalk.dim('[Type: ' + option.type.name + ']'));

            if (option.multiple) right.push(chalk.dim('[Multiple]'));

            if (option.env) right.push(chalk.dim('[Env: ' + option.env + (process.env[option.env] ? '=' + process.env[option.env] : '') + ']'));

            if (option.hasOwnProperty('defaultValue')) {
                if (typeof option.defaultValue === 'object' && option.defaultValue) {
                    defValue = JSON.stringify(option.defaultValue, null, 2);
                } else {
                    defValue = option.defaultValue;
                    if (typeof defValue === 'string') defValue = '"' + defValue + '"';
                }
                right.push(chalk.dim('[Default: ' + defValue + ']'));
            }

            left = {
                content: argName,
                width: width + 2,
                hangingIndent: '  ',
                paddingLeft: '  '
            };

            body = {
                content: '',
                justify: true
            };
            if (option.description) {
                body.content = typeof option.description === 'function' ?
                    option.description(params) + '\n' :
                    option.description + '\n'
            }
            if (right.length > 0) body.content += right.join('\n');

            result += help.columns([ left, body ]) + '\n';
            if (optionIndex < group.options.length - 1) result += '\n';
        });


    });

    return result.replace(/\n+$/, '');
};

function camelToDash(str) {
    var index = 0;
    var match;
    var result = '';
    var rx = /[A-Z]/g;
    var subStr;

    while (match = rx.exec(str)) {
        subStr = str.substring(index, match.index).toLowerCase();
        if (subStr) result += subStr + '-';
        index = match.index;
    }

    return result + str.substr(index).toLowerCase();
}