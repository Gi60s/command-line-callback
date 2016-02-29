"use strict";
var Command = require('../index.js');

Command.defaultCommand = 'abc';

Command.define('abc', abcCommand, { brief: 'The abc command.' });
Command.define('def', defCommand, { brief: 'The def command.'});

Command.evaluate();



function abcCommand(config) {
    console.log('You have called the abc command.');
}

function defCommand(config) {
    console.log('You have called the default command.');
}

