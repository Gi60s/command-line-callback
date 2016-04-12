var Command = require('../bin/command-line-callback');

var configuration = {
    brief: 'Output the property',
    options: {
        directory: {
            alias: 'd',
            description: 'A directory path',
            type: String,
            required: true
        },
        min: {
            description: 'A non-negative integer.',
            type: Number,
            transform: function(value) {
                return Math.round(value);
            },
            validate: function(value) {
                return value >= 0;
            }
        }
    }
};

function echoHandler(options) {
    console.log(options);
}

Command.define('echo', echoHandler, configuration);

Command.evaluate();