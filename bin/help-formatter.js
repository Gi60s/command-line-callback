var chalk           = require('chalk');
var format          = require('cli-format');
var is              = require('./is-type');

var store = {};

module.exports = formatter;

function formatter(name, configuration) {
    if (!store.hasOwnProperty(name)) throw new Error('Cannot use undefined help formatter: ' + name);
    return store[name](configuration);
}

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
    return format.wrap(chalk.underline.bold(text)) + '\n\n';
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


//////////////////////////////////////
//                                  //
//      DEFINE SOME FORMATTERS      //
//                                  //
//////////////////////////////////////

formatter.define('default', function(config) {
    function section(name) {
        var result = formatter(name, config);
        if (result.length > 0) result += '\n\n';
        return result;
    }

    return section('introduction', config) +
        section('synopsis', config) +
        section('examples', config) +
        section('options', config);
});

formatter.define('examples', function(config) {
    var result = '';
    config.examples.forEach(function(example, index) {
        result += formatter.section(example.title, example.body, true);
    });
    return result;
});

formatter.define('introduction', function(config) {
    var body = '';
    if (config.description) body += config.description;
    if (config.help) body += (body.length > 0 ? '\n\n' : '') + config.help;
    if (body.length === 0) body += chalk.italic('No description');
    return formatter.section(config.title, body);
});

formatter.define('item-description', function(config) {
    var result = '';
    if (config.title && config.body) {
        result += format.columns(config.title, config.body, { width: [15, null], paddingLeft: '  '});
    }
    return result;
});

formatter.define('options', function(config) {
    var dash = '\u2010';
    var keys = Object.keys(config.options);
    var groups = Object.assign({'': 'Options'}, config.groups);
    var result = '';

    Object.keys(groups).forEach(function (group, index) {
        var first = true;
        if (index > 0) result += '\n';
        keys.forEach(function (name) {
            var argName;
            var left;
            var opt = config.options[name];
            if ((group === '' && (!opt.group || !groups[opt.group])) || opt.group === group) {
                if (first) {
                    result += formatter.heading(groups[group]);
                    first = false;
                }
                argName = (opt.alias ? chalk.bold(dash + opt.alias) + ', ' : '') + chalk.bold(dash + dash + name);
                left = format.wrap(argName, {width: 13, hangingIndent: ' '});
                result += formatter('item-description', { title: left, body: opt.description });
            }
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


