var Command = require('../bin/command-line-callback');

var configuration = {
    brief: 'Output the directory argument.',
    options: {
        directory: {
            alias: 'd',
            description: 'A directory path',
            type: String,
            env: 'HOME',
            defaultValue: './'
        }
    }
};

function echoHandler(options) {
    console.log(options.directory);
}

Command.define('echo', echoHandler, configuration);

Command.evaluate();