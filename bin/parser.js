/**
 * This file allows for the defining of relationships between strings and constructor. It
 * will take a string value and run it through the parser and constructor to return the
 * actual value.
 */

var CustomError     = require('custom-error-instance');
var vm              = require('vm');

var Err = CustomError('CLCArgError');
Err.param = CustomError(Err, { code: 'EPARAM' }, CustomError.factory.expectReceive);
Err.udef = CustomError(Err, { code: 'EUDEF', message: 'No parser is defined for the factory provided.'});
var store = [];

Object.defineProperty(exports, 'error', {
    enumerable: false,
    configurable: true,
    value: Err,
    writable: true
});

/**
 * Define a parser that converts the a string into its instance equivalent.
 * @param {function} factory The function used to generate the value.
 * @param {string} undefinedReplacement The string value to send to the parser if the value is undefined.
 * @param {function} parser The function to parse the string and call the constructor.
 */
exports.define = function(factory, undefinedReplacement, parser) {
    var index = getParserIndex(factory);
    if (typeof parser === 'undefined') parser = factory;

    // validate input parameters
    if (typeof factory !== 'function') throw new Err.param({ message: 'Invalid factory.', name: 'factory', expected: 'a function', received: factory });
    if (typeof undefinedReplacement !== 'string') throw new Err.param({ message: 'Invalid undefined replacement.', name: 'undefinedReplacement', expected: 'a string', received: undefinedReplacement});
    if (typeof parser !== 'function') throw new Err.param({ message: 'Invalid parser.', name: 'parser', expected: 'a function', received: parser });

    // remove old definition
    if (index !== -1) store.splice(index, 1);

    // add new definition
    store.push({
        factory: factory,
        parser: function(value) {
            if (typeof value !== 'string' || value === '') value = undefinedReplacement;
            return parser(value, factory);
        }
    });
};

/**
 * Determine if a value parser has been defined for the specified factory.
 * @param {function} factory
 * @returns {function}
 */
exports.exists = function(factory) {
    return getParserIndex(factory) !== -1;
};

/**
 * Run a value through its associated parser.
 * @param {function} factory
 * @param {string} value
 * @returns {*}
 */
exports.parse = function(factory, value) {
    var index;
    var parser;
    if (typeof value !== 'string') throw new Err.param('Value parser value must be a string. Received: ' + value);
    index = getParserIndex(factory);
    if (index === -1) throw new Err.udef();
    parser = store[index].parser;
    return parser(value);
};

/**
 * Reset the store to it's default state.
 */
exports.reset = function() {
    store = [];

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
};





function getParserIndex(factory) {
    var i;
    for (i = 0; i < store.length; i++) {
        if (store[i].factory === factory) return i;
    }
    return -1;
}

function evalJavaScript(str) {
    var sandbox = {value: void 0};
    try {
        vm.createContext(sandbox);
        vm.runInContext('value = ' + str, sandbox);
    } catch (e) {
        return void 0;
    }
    return sandbox.value;
}

// initialize the store
exports.reset();