/**
 * Try running this example file from the command line with one or more of the following commands:
 *
 * 1) node types.js type -b -n 5 -o "{ age: 5 }" -a "[ 1, 2, 3 ]" -s Hello
 * 2) node types.js type -b false -n 5 -o "{ age: 5 }" -a "[ 1, 2, 3 ]" -s Hello
 *
 */

var chalk = require('chalk');
var clc = require('../index.js');

//define the type function
function type(err, options) {
    var result = '';
    if (err) throw err;

    Object.keys(options).forEach(function(name, index) {
        var value = options[name];
        if (index > 0) result += '\n\n';
        result += chalk.underline.bold(name) + '\n' +
            '  Type: ' + (typeof value) + '\n';
        if (typeof value === 'object') result += '  Constructor: ' + value.constructor.name + '\n';
        result += '  Value: ' + value;
    });

    return result;
}

//define a command interface to call the add function
clc.define('type', type, {
    brief: 'Specify a parameter from one of many types.',
    description: 'The --first option is required (with a value) for this command to execute. The --second option is optional with a default value of zero.',
    synopsis: [
        '[OPTIONS]...'
    ],
    options: {
        boolean: {
            alias: 'b',
            description: 'A boolean. Using this option defaults to true unless you set it to 0, false, or null',
            type: Boolean
        },
        number: {
            alias: 'n',
            description: 'A number. Using this option attempts to set a number value or will default to zero if unsuccessful',
            type: Number
        },
        string: {
            alias: 's',
            description: 'A string. Using this option attempts to set a string value or will default to empty string if unsuccessful',
            type: String
        },
        array: {
            alias: 'a',
            description: 'An array. Using this option attempts to create an array from the value.',
            type: Array
        },
        date: {
            alias: 'd',
            description: 'A date. Using this option attempts to create an date from the value.',
            type: Date
        },
        object: {
            alias: 'o',
            description: 'An object. Using this option attempts to create an object from the value.',
            type: Object
        }
    }
});

//evaluate the command line args used to start this app
clc.evaluate();