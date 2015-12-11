var format          = require('cli-format');
var is              = require('./is-type');

var store = {};

module.exports = formatter;

function formatter(name, configuration) {
    if (!store.hasOwnProperty(name)) throw new Error('Cannot use undefined help formatter: ' + name);
    return store[name](configuration);
}

formatter.ansi = {
    bold: bold,
    boldUnderline: boldUnderline,
    faint: faint,
    italic: italic,
    red: red,
    underline: underline
};

/**
 * Define the configuration to use on the body. Each defined formatter
 * should use this config on its body.
 * @type {object}
 */
formatter.bodyConfig = {
    paddingLeft: '  '
};

/**
 * Define which formatter template is the default.
 * @type {string}
 */
formatter.defaultTemplate = 'default';

/**
 * Get a string that represents the description and help together.
 * @param {object} config
 * @param {string} [seperator='\n\n']
 * @returns {string}
 */
formatter.descriptionAndHelp = function(config, seperator) {
    var result = '';
    if (!seperator) seperator = '\n\n';
    if (config.description) result += config.description;
    if (config.help) result += (result.length > 0 ? seperator : '') + config.help;
    return result;
};

/**
 * Define a new formatter.
 * @param {string} name
 * @param {function} handler
 */
formatter.define = function(name, handler) {
    if (!is.string(name)) throw new Error('Help formatter expects the first parameter to be a string. Received: ' + name);
    if (!is.function(handler)) throw new Error('Help formatter expects the second parameter to be a function. Received: ' + handler);
    store[name] = handler;
};

/**
 * Define how the heading should be formatted. Each defined formatter
 * should use this function on its heading.
 * @param {string} text
 * @returns {string}
 */
formatter.heading = function(text) {
    return format.wrap(boldUnderline(text)) + '\n\n';
};

/**
 * Get an existing formatter's handler.
 * @returns {function}
 */
formatter.get = function() {
    return store[name];
};

/**
 * Generate a generic section string. This will automatically wrap
 * the header and the body.
 * @param {string} title
 * @param {string} body
 * @param {boolean} [padTop=false]
 * @returns {string}
 */
formatter.section = function(title, body, padTop) {
    return (padTop ? '\n\n' : '') +
        formatter.heading(title) +
        format.wrap(body, formatter.bodyConfig);
};



function ansi(text) {
    var codes = Array.prototype.slice.call(arguments, 1).join(';');
    return '\u001b[' + codes + 'm' + text + '\u001b[0m';
}

function bold(text) {
    return ansi(text, 1);
}

function boldUnderline(text) {
    return ansi(text, 1, 4);
}

function faint(text) {
    return ansi(text, 2);
}

function italic(text) {
    return ansi(text, 3);
}

function red(text) {
    return ansi(text, 31);
}

function underline(text) {
    return ansi(text, 4);
}




//////////////////////////////////////
//                                  //
//      DEFINE SOME FORMATTERS      //
//                                  //
//////////////////////////////////////

formatter.define('default', function(config) {
    function section(name, last) {
        var result = formatter(name, config);
        if (result.length > 0 && last !== true) result += '\n\n';
        return result;
    }

    return section('introduction') +
        section('synopsis') +
        section('examples') +
        section('options', true);
});

formatter.define('examples', function(config) {
    var result = '';
    config.examples.forEach(function(example, index) {
        result += formatter.section(example.title, example.body, index > 0);
    });
    return result;
});

formatter.define('introduction', function(config) {
    var body = formatter.descriptionAndHelp(config);
    if (body.length === 0) body += italic('No description');
    return formatter.section(config.title, body);
});

formatter.define('item-description', function(config) {
    var result = '';
    var width = config.width || 16;
    if (config.title && config.body) {
        result += format.columns(config.title, config.body, { width: [width, null], paddingLeft: '  ', paddingMiddle: '  ' });
    }
    return result;
});

formatter.define('options', function(config) {
    var dash = '\u2010';
    var maxWidth = 35;
    var optionKeys = Object.keys(config.options);
    var groupMap;
    var groups = [];
    var result = '';
    var strWidth = format.stringWidth;

    //create a group mapping (between keys and labels)
    groupMap = Object.assign({'': 'Options'}, config.groups);

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

                argName = (opt.alias ? bold(dash + opt.alias) + ', ' : '') + bold(dash + dash + optName);
                group.argNames.push(argName);

                argWidth = strWidth(argName);
                if (argWidth > maxWidth) argWidth = maxWidth;
                if (argWidth > group.argColumnWidth) group.argColumnWidth = argWidth;
            }
        }

        if (found) groups.push(group);
    });

    //create the result
    groups.forEach(function(group, groupIndex) {

        //add the group header
        if (groupIndex > 0) result += '\n';
        result += formatter.heading(group.label);

        group.options.forEach(function(option, optionIndex) {
            var argName = group.argNames[optionIndex];
            var defValue;
            var left = format.wrap(argName, { width: group.argColumnWidth, hangingIndent: '  '} );
            var right = formatter.descriptionAndHelp(option, '\n');
            var type;

            if (option.required) right += (right.length > 0 ? '\n' : '') + faint('[Required]') + ' ';

            if (option.type.name && option.type.name !== 'Boolean') {
                right += (right.length > 0 ? '\n' : '') + faint('[Type: ' + option.type.name + ']');
            }

            if (option.hasOwnProperty('defaultValue')) {
                if (right.length > 0) right += '\n';
                if (typeof option.defaultValue === 'object' && option.defaultValue) {
                    defValue = JSON.stringify(option.defaultValue, null, 2);
                    right += faint('[Default: ' + defValue + ']');
                } else {
                    defValue = option.defaultValue;
                    if (typeof defValue === 'string') defValue = '"' + defValue + '"';
                    right += faint('[Default: ' + defValue + ']');
                }
            }

            result += formatter('item-description', { title: left, body: right, width: group.argColumnWidth });
            if (optionIndex < group.options.length - 1) result += '\n';
        });


    });

    return result;
});

formatter.define('synopsis', function(config) {
    var body = '';
    if (config.synopsis.length === 0) return '';
    config.synopsis.forEach(function(line, index) {
        if (index > 0) body += '\n';
        body += format.wrap(config.title + ' ' + line, formatter.bodyConfig);
    });
    return formatter.heading('Synopsis') + body;
});






