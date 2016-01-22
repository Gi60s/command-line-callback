"use strict";
var chalk           = require('chalk');
var format          = require('cli-format');
var help            = require('./help');

exports.command = function(appName, commandName, config) {
    var result = [];

    result.push(help.section(config.title, config.brief));

    if (config.synopsis) {
        result.push(help.synopsis(appName + ' ' + commandName, config.synopsis));
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
        result.push(exports.options(config));
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

    result.push(help.section(appName,
            'This application accepts multiple commands as can be seen below in the command list.'));

    result.push(help.synopsis(appName, ['[COMMAND] [OPTIONS]...']));

    result.push(help.section('Command Help',
            'To get help on any of the commands, type the command name followed by --help.' +
            (commands.length > 0 ? ' For example: \n\n' + appName + ' ' + commands[0] + ' --help' : '')));

    if (commands.length === 0) {
        body = chalk.italic('No commands are defined.');
    } else {
        body = [];
        width = help.width(commands, 35);
        commands.forEach(function(commandName) {
            var brief = commandStore[commandName].configuration.brief || '';
            body.push(help.columns(chalk.bold(commandName), brief, width));
        });
    }
    result.push(help.heading('Commands') + body.join('\n'));

    return result.join('\n\n');
};

exports.options = function(config) {
    var dash = '\u2010';
    var maxWidth = 35;
    var optionKeys = Object.keys(config.options);
    var groupMap;
    var groups = [];
    var result = '';
    var strWidth = format.stringWidth;
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
        var optName;

        group = {
            argColumnWidth: 0,
            argNames: [],
            key: groupKey,
            label: groupMap[groupKey],
            options: []
        };

        for (i = 0; i < optionKeys.length; i++) {
            optName = optionKeys[i];
            opt = config.options[optName];
            if ((groupKey === '' && (!opt.group || !groupMap[opt.group])) || opt.group === groupKey) {
                found = true;

                group.options.push(opt);

                argName = chalk.bold((opt.alias ? dash + opt.alias + ', ' : '') + dash + dash + optName);
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
        result += help.heading(group.label);

        group.options.forEach(function(option, optionIndex) {
            var argName = group.argNames[optionIndex];
            var body;
            var defValue;
            var left = format.wrap(argName, { width: group.argColumnWidth, hangingIndent: '  '} );
            var right = [];

            if (option.required) right.push('[Required]');

            if (option.type.name && option.type.name !== 'Boolean') right.push('[Type: ' + option.type.name + ']');

            if (option.hasOwnProperty('defaultValue')) {
                if (typeof option.defaultValue === 'object' && option.defaultValue) {
                    defValue = JSON.stringify(option.defaultValue, null, 2);
                } else {
                    defValue = option.defaultValue;
                    if (typeof defValue === 'string') defValue = '"' + defValue + '"';
                }
                right.push('[Default: ' + defValue + ']');
            }

            body = option.description ? option.description + '\n' : '';
            if (right.length > 0) body += chalk.dim(right.join('\n'));

            result += help.columns(left, body, width); //group.argColumnWidth);
            if (optionIndex < group.options.length - 1) result += '\n';
        });


    });

    return result.replace(/\n+$/, '');
};