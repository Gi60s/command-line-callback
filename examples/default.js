"use strict";
var Command = require('../index.js');

Command.defaultCommand = 'default';

Command.define('abc', abcCommand, { brief: 'The abc command.' });
Command.define('default', defaultCommand, { brief: 'The default command.'});

Command.evaluate();



function abcCommand(config) {
    console.log('You have called the abc command.');
}

function defaultCommand(config) {
    console.log('You have called the default command.');
}

