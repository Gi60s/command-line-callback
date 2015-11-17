var colors = require('colors/safe');
var wordWrap = require('./word-wrap');

console.log('         1         2         3         4         5         6         7         8');

var clc = require('./command-line-callback');

clc.define('myCommand', function(commandName, args) {}, {
    alias: ['myCoolCommand', 'myCmd'],
    title: 'myCommand',
    description: 'my command my command my command my command my command my command my command my command my command my command ',
    footer: '',
    options: []
});

clc.evaluate();
