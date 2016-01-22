# Working Example Explained

If you have a file `math.js` with the following content:

```js
var clc = require('command-line-callback');

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

clc.define('add', add, {
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

clc.define('sum', sum, {
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
            description: 'A number to add to the sum',
            type: Number,
            multiple: true,
            required: true
        }
    }
});

//define a command interface to call the sum function after transforming inputs to absolute values
clc.define('sum-absolute', sum, {
    brief: 'Add the absolute value of multiple numbers together.',
    description: 'You can add any number of arguments to be summed to this command.',
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
```

Then from the command line you have some things you can do.

## Get Help about the Command

Execute the command: `$ node math add --help`

```text
math add

  Add two numbers together.

Synopsis

  math add [OPTIONS]...
  math add --first 1 --second 2
  math add -f 1 -s 2

Description

  The --first option is required (with a value) for this command to execute. The
  --second option is optional with a default value of zero.

Example

  The command: math add --first 1 --second 2
  Will output: 3

Number Options

  ‐f, ‐‐first   The first number
                [Required]
                [Type: Number]

  ‐s, ‐‐second  The second number
                [Type: Number]
                [Default: 0]

Misc Options

  ‐‐help        Get usage details about this command.
```

## Execute the Command

Execute from the command line: `node math add --first 5 -s 10`

```text
15
```

## Forget a Required Option

Execute from the command line: `node math add`

```text
Connect execut command "add" because one or more options are not valid:
  Missing required option: first

math add

  Add two numbers together.

Synopsis

  math add [OPTIONS]...
  math add --first 1 --second 2
  math add -f 1 -s 2

  ... and the rest of the help
```

## Forget the Command

Execute from the command line: `node math` or `node math --help`

```text
math

  This application accepts multiple commands as can be seen below in the command list.

Synopsis

  math [COMMAND] [OPTIONS]...

Command Help

  To get help on any of the commands, type the command name followed by --help. For
  example:

  math add --help

Commands

  add           Add two numbers together.

  sum           Add multiple numbers together.

  sum-absolute  Add the absolute value of multiple numbers together.
```

