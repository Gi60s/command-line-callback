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

var Command = require('../index.js');


function add(options) {
    return options.first + options.second;
}

function sum(options) {
    var result = 0;
    if (options.number) {
        options.number.forEach(function (value) {
            result += value;
        });
    }
    return result;
}

//define a command interface to call the add function
Command.define('add', add, {
    brief: 'Add two numbers together.',
    description: 'The --first option is required (with a value) for this command to execute. ' +
    'The --second option is optional with a default value of zero.',
    synopsis: [
        '[OPTIONS]...',
        '--first 1 --second 2',
        '-f 1 -s 2'
    ],
    sections: [
        {
            title: 'Example',
            body: 'The command: math add --first 1 --second 2\nWill output: 3',
            beforeOptions: true
        }
    ],
    groups: {
        numbers: 'Number Options'
    },
    options: {
        first: {
            alias: 'f',
            description: 'The first number',
            type: Number,
            required: true,
            group: 'numbers'
        },
        second: {
            alias: 's',
            description: 'The second number',
            type: Number,
            defaultValue: 0,
            group: 'numbers'
        }
    }
});

//define a command interface to call the sum function
Command.define('sum', sum, {
    brief: 'Add multiple numbers together.',
    description: 'You can add any number of arguments to be summed to this command.',
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
            description: function(p) { return 'A number to add to the sum.' + p.app + ' ' + p.command },
            type: Number,
            multiple: true,
            required: true
        }
    }
});

//define a command interface to call the sum function after transforming inputs to absolute values
Command.define('sum-absolute', sum, {
    brief: 'Add the absolute value of multiple numbers together.',
    description: 'You can add any number of arguments to be summed to this command.',
    synopsis: [
        '[OPTIONS]...',
        '[NUMBERS]...',
        '-n 1 -n -2 --number 3',
        '1 -2 3'
    ],
    defaultOption: 'number',
    groups: {
        'number': 'Math Options'
    },
    options: {
        number: {
            alias: 'n',
            description: 'A number to add to the sum',
            type: Number,
            multiple: true,
            required: true,
            transform: function (value) {
                return Math.abs(value);
            },
            group: 'number'
        }
    }
});

//evaluate the command line args used to start this app
Command.evaluate();