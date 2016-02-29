"use strict";
var Command = require('../index.js');

Command.define('', callback, {});
Command.evaluate();

function callback(config) {
    console.log('You executed the command.');
}