"use strict";
var Command = require('../index.js');

Command.define('single', callback, {
    brief: 'This is a single command',
    synopsis: [
        '[OPTIONS]...'
    ]
});
Command.evaluate();

function callback(config) {
    console.log('You executed the command.');
}