var args                = require('../bin/command-line-args');
var test                = require('tape');

test('Argument map', function(t) {
    var input;
    var output;
    var config = {
        defaultOption: 'def',
        options: {
            name: {
                type: String,
                multiple: true
            },
            bool: {
                type: Boolean,
                multiple: true
            },
            age: {
                type: Number,
                multiple: true
            },
            gender: {
                alias: 'g',
                type: String,
                multiple: true
            },
            color: {
                alias: 'c',
                type: String,
                multiple: true
            },
            def: {
                type: String,
                multiple: true
            }
        }
    };

    input = ['--name', 'bob', '--age', '5', 'baz', '-g', 'male', '-c', 'red', '-c', 'blue', 'foo', 'bar'];
    output = {
        name: ['bob'],
        age: ['5'],
        gender: ['male'],
        color: ['red', 'blue'],
        def: ['baz', 'foo', 'bar']
    };
    t.deepEqual(args.map(config, input), output, 'map 1');

    input = ['--name', 'bob', '--age', '5', '-g', 'male', '-c', 'red', '-c', 'blue', 'foo', 'bar'];
    output = {
        name: ['bob'],
        age: ['5'],
        gender: ['male'],
        color: ['red', 'blue']
    };
    delete config.defaultOption;
    t.deepEqual(args.map(config, input), output, 'map 2');

    t.end();
});

test('Arguments to Options', function(t) {
    var input;
    var output;
    var config;

    config = {
        defaultOption: 'def',
        options: {
            name: {
                type: String
            },
            bool: {
                type: Boolean
            },
            age: {
                type: Number
            },
            gender: {
                alias: 'g',
                type: String
            },
            color: {
                alias: 'c',
                type: String
            },
            def: {
                type: String
            }
        }
    };

    input = [
        '--name', 'bob',
        '--age', '5',
        'baz',
        '-g', 'male',
        '-c', 'red',
        '--color', 'blue',
        '-bc', 'green',
        'foo',
        'bar'];
    output = {
        name: 'bob',
        age: 5,
        gender: 'male',
        color: 'green',
        def: 'bar'
    };
    t.deepEqual(args.options(config, input), output, 'no multiples');

    output = {
        name: 'bob',
        age: 5,
        gender: 'male',
        color: ['red', 'blue', 'green'],
        def: ['baz', 'foo', 'bar']
    };
    config.options.color.multiple = true;
    config.options.def.multiple = true;
    t.deepEqual(args.options(config, input), output, 'multiples');

    t.end();
});