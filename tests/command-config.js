var config              = require('../bin/command-config');
var test                = require('tape');

test('Normalize option', function(t) {
    var input;
    var output;

    //full build
    input = {
        alias: 'n',
        defaultValue: 0,
        description: 'A number to add to the sum.',
        group: 'math',
        help: 'Each number can be positive, or negative',
        multiple: true,
        required: false,
        transform: transform,
        type: Number,
        validator: validator
    };
    output = input;
    t.deepEqual(config.normalizeOption(input), output, 'Full build');

    //default value
    input = {};
    output = defaultBuild();
    t.deepEqual(config.normalizeOption(input), output, 'Default build');

    //required and default value
    input = { required: true, defaultValue: true };
    t.throws(function() { config.normalizeOption(input); }, 'Options required and defaultValue are mutually exclusive 1');
    input = { required: false, defaultValue: true };
    t.doesNotThrow(function() { config.normalizeOption(input); }, 'Options required and defaultValue are mutually exclusive 2');
    input = { defaultValue: true };
    t.doesNotThrow(function() { config.normalizeOption(input); }, 'Options required and defaultValue are mutually exclusive 3');
    input = { required: true };
    t.doesNotThrow(function() { config.normalizeOption(input); }, 'Options required and defaultValue are mutually exclusive 4');

    t.end();

});

test('Normalize Options', function(t) {
    var input;
    var output;

    input = {
        name: {},
        age: {}
    };
    output = {
        name: defaultBuild(),
        age: defaultBuild()
    };
    t.deepEqual(config.normalizeOptions(input), output, 'Default options');

    t.end();
});

test('Alias Map', function(t) {
    var input;
    var output;

    input = {
        name: {
            alias: 'n'
        },
        age: {
            alias: 'a'
        },
        gender: {}
    };
    output = {
        n: 'name',
        a: 'age'
    };
    t.deepEqual(config.aliasMap(input), output, 'Alias map');

    t.end();
});

test('Normalize', function(t) {
    var template;
    var input;

    template = {
        description: 'Get the absolute sum of numbers.',
        defaultOption: 'number',
        examples: [
            {
                title: 'Example 1',
                body: 'This is an example.'
            }
        ],
        groups: {
            math: 'Math Options',
            message: 'Message Options'
        },
        help: 'All numbers provided made positive and then added to the sum.',
        options: {},
        synopsis: [
            '[OPTIONS]...',
            '--number 5 -n 3 --message "Hello, World!"'
        ]
    };
    t.deepEqual(config.normalize(template), template, 'Full build');

    input = Object.assign({}, template, { description: {} });
    t.throws(function() { config.normalize(input); }, 'Invalid description');

    input = Object.assign({}, template, { defaultOption: {} });
    t.throws(function() { config.normalize(input); }, 'Invalid default option');

    input = Object.assign({}, template, { examples: {} });
    t.throws(function() { config.normalize(input); }, 'Invalid examples 1');
    input = Object.assign({}, template, { examples: [ {} ] });
    t.throws(function() { config.normalize(input); }, 'Invalid examples 2');

    input = Object.assign({}, template, { groups: { math: 5 } });
    t.throws(function() { config.normalize(input); }, 'Invalid groups 1');
    input = Object.assign({}, template, { groups: [] });
    t.throws(function() { config.normalize(input); }, 'Invalid groups 2');

    input = Object.assign({}, template, { help: {} });
    t.throws(function() { config.normalize(input); }, 'Invalid help');

    input = Object.assign({}, template, { options: [] });
    t.throws(function() { config.normalize(input); }, 'Invalid options');

    input = Object.assign({}, template, { synopsis: {} });
    t.throws(function() { config.normalize(input); }, 'Invalid synopsis 1');
    input = Object.assign({}, template, { synopsis: [ {} ] });
    t.throws(function() { config.normalize(input); }, 'Invalid synopsis 2');

    t.end();
});

function transform(value) {
    return Math.abs(value);
}

function validator(value) {
    return !isNaN(value);
}

function defaultBuild() {
    return {
        alias: '',
        description: '',
        group: '',
        help: '',
        multiple: false,
        required: false,
        transform: config.defaultTransform,
        type: Boolean,
        validator: config.defaultValidator
    }
}