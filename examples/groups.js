"use strict";
var Command = require('../index.js');

Command.define('groups', callback, {
    brief: 'A command who\'s help shows how to group options.',
    groups: {
        groupA: 'Group A Options',
        groupB: {
            title: 'Group B Options',
            description: 'This description tells a bit about the group B options.'
        }
    },
    options: {
        optionAOne: {
            alias: 'a',
            description: 'Option A One.',
            group: 'groupA'
        },
        optionATwo: {
            description: 'Option A Two.',
            group: 'groupA'
        },
        optionB: {
            description: 'Option B.',
            group: 'groupB'
        }
    }
});
Command.evaluate();

function callback(config) {
    console.log('You executed the command.');
}