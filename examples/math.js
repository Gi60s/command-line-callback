/**
 * Try running this example file from the command line with one or more of the following commands:
 *
 * 1) node math.js                  //gives help on the commands available for this app
 * 2) node math.js --help           //gives help on the commands available for this app
 * 3) node math.js add --help       //gives help on the add command
 * 4) node math.js add -f 5 -s -3   //adds 5 + -3 and outputs the result
 * 5) node math.js sum              //throws an error
 * 6) node math.js sum 1 2 3 4      //adds 1 + 2 + 3 + 4 and outputs the result
 */

var clc = require('../index.js');

//define a command interface to call the add function
clc.define('add', add, {
    description: 'Add two numbers together.',
    help: 'The --first option is required (with a value) for this command to execute. The --second option is optional with a default value of zero.',
    synopsis: [
        '[OPTIONS]...',
        '--first 1 --second 2',
        '-f 1 -s 2'
    ],
    groups: {
        numbers: 'Numbers'
    },
    options: {
        first: {
            alias: 'f',
            description: 'The first number',
            help: 'This option is required',
            type: Number,
            required: true
        },
        second: {
            alias: 's',
            description: 'The second number',
            type: Number,
            defaultValue: 0
        },
        'bob-bob-bob-blah': {
            description: 'An object',
            type: Object,
            defaultValue: {
                name: 'bob',
                age: 5,
                school: {
                    name: 'byu',
                    grade: 'A',
                    courses: [{ econ: 'A'}]
                }
            }
        },
        ar: {
            type: Array,
            defaultValue: []
        }
    }
});

//define a command interface to call the sum function
clc.define('sum', sum, {
    description: 'Add multiple numbers together.',
    help: 'You can add any number of arguments to be summed to this command.',
    synopsis: [
        '[OPTIONS]...',
        '[NUMBERS]...',
        '-n 1 -n 2 --number 3',
        '1 2 3'
    ],
    defaultOption: 'number',
    options: {
        number: {
            alias: 'n',
            description: 'A number to add to the sum',
            type: Number,
            multiple: true,
            required: true
        }
    }
});

//define a command interface to call the sum function after transforming inputs to absolute values
clc.define('sum-absolute', sum, {
    description: 'Add the absolute value of multiple numbers together.',
    help: 'You can add any number of arguments to be summed to this command.',
    synopsis: [
        '[OPTIONS]...',
        '[NUMBERS]...',
        '-n 1 -n -2 --number 3',
        '1 -2 3'
    ],
    defaultOption: 'number',
    options: {
        number: {
            alias: 'n',
            description: 'A number to add to the sum',
            type: Number,
            multiple: true,
            required: true,
            transform: function (value) {
                return Math.abs(value);
            }
        }
    }
});

//evaluate the command line args used to start this app
clc.evaluate();





function add(err, options) {
    if (!err) return options.first + options.second;
}

function sum(err, options) {
    var result = 0;
    if (err) throw err;
    if (options.number) {
        options.number.forEach(function (value) {
            result += value;
        });
    }
    return result;
}