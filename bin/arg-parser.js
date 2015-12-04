var vm              = require('vm');

var store = [];

/**
 * Define a parser that converts the argument string into its instance equivalent.
 * @param {function} factory The function used to generate the value.
 * @param {string} undefinedReplacement The string value to send to the parser if the value is undefined.
 * @param {function} parser The function to parse the string and call the constructor.
 */
exports.define = function(factory, undefinedReplacement, parser) {
    var index = getParserIndex(factory);
    if (typeof parser === 'undefined') parser = factory;

    if (typeof factory !== 'function') throw new Error('Factory must be a function. Received: ' + factory);
    if (typeof undefinedReplacement !== 'string') throw new Error('Undefined replacement must be a string. Received: ' + undefinedReplacement);
    if (typeof parser !== 'function') throw new Error('Parser must be a function. Received: ' + parser);

    if (index !== -1) store.splice(index, 1);
    store.push({
        factory: factory,
        parser: function(value) {
            if (typeof value !== 'string') value = undefinedReplacement;
            return parser(value, factory);
        }
    });
};

/**
 * Get a parser function.
 * @param {function} factory
 * @returns {function}
 */
exports.get = function(factory) {
    var index = getParserIndex(factory);
    if (index === -1) throw new Error('No parser is defined for the factory provided.');
    return store[index].parser;
};

/**
 * Run a value through its associated parser.
 * @param {function} factory
 * @param {string} value
 * @returns {*}
 */
exports.parse = function(factory, value) {
    var parser = exports.get(factory);
    if (!parser) throw new Error('No parser is defined for the factory provided.');
    return parser(value);
};


function getParserIndex(factory) {
    var i;
    for (i = 0; i < store.length; i++) {
        if (store[i].factory === factory) return i;
    }
    return -1;
}

function evalJavaScript(str) {
    var sandbox = {value: []};
    try {
        vm.createContext(sandbox);
        vm.runInContext('value = ' + str, sandbox);
    } catch (e) {
        return void 0;
    }
    return sandbox.value;
}


//////////////////////////////////////
//                                  //
//      SOME PARSER DEFINITIONS     //
//                                  //
//////////////////////////////////////

exports.define(Array, '[]', function(value, factory) {
    var val = evalJavaScript(value);
    return Array.isArray(val) ? val : factory(value);
});

exports.define(Boolean, 'true', function(value, factory) {
    if (value === 'true') return factory(true);
    if (value === 'false') return factory(false);
    if (!isNaN(value)) return factory(parseInt(value));
    return factory(!!value);
});

exports.define(Date, '', function(value, factory) {
    if (!isNaN(value)) value = parseInt(value);
    return new factory(value);
});

exports.define(Number, '');

exports.define(String, '');

exports.define(Object, '{}', function(value, factory) {
    var val = evalJavaScript(value);
    return typeof val === 'object' ? val : factory(value);
});