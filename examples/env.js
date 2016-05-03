"use strict";
var Command = require('../index.js');
var path = require('path');

Command.define('env', callback, {
    brief: 'This command requires uses an file path',
    synopsis: [
        '[OPTIONS]...'
    ],
    options: {
        name: {
            type: String,
            description: 'A name to greet you by.',
            env: 'MY_NAME',
            required: true
        },
        envFile: {              // make a reassignment of the default envFile option to include a default value
            type: String,
            description: 'The file path to an environment configuration file that is used to populate environment variables.',
            defaultValue: path.resolve(__dirname, 'envfile-default.txt')
        }
    }
});
Command.evaluate();

function callback(config) {
    console.log('Hello, ' + config.name);
}