var vm              = require('vm');

var store = [];

/**
 * Define or redefine a constructor.
 * @param {function} constructor The constructor function.
 * @param {function} preConstructor A function to call to parse a string and call the constructor
 */
exports.define = function(constructor, preConstructor) {
    var index = getIndex(constructor);
    if (typeof constructor !== 'function') throw new Error('Constructor must be a function. Received: ' + constructor);
    if (typeof preConstructor !== 'function') throw new Error('Pre-constructor must be a function. Received: ' + preConstructor);

    if (index !== -1) store.splice(index, 1);
    store.push({
        constructor: constructor,
        pre: preConstructor
    });
};

/**
 * Check to see if a pre-constructor has been defined for this constructor.
 * @param {function} constructor
 * @returns {boolean}
 */
exports.exists = function(constructor) {
    return getIndex(constructor) !== -1;
};

/**
 * Get the defined pre-constructor for a constructor.
 * @param {function} constructor
 * @returns {Function} The associated pre-constructor.
 */
exports.get = function(constructor) {
    var o = store[getIndex(constructor)];
    return o ? o.pre : void 0;
};

/**
 * Run a constructor (via a defined pre-constructor if available).
 * @param {function} constructor
 * @param {string} value
 * @returns {*}
 */
exports.run = function(constructor, value) {
    var preConstructor = exports.get(constructor);
    if (preConstructor) {
        return preConstructor(value, constructor);
    } else {
        return constructor(value);
    }
};

function getIndex(constructor) {
    var i;
    for (i = 0; i < store.length; i++) {
        if (store[i].constructor === constructor) return i;
    }
    return -1;
}




exports.define(Array, function(value, constructor) {
    var sandbox = {value: []};
    vm.createContext(sandbox);
    vm.runInContext('value = ' + value, sandbox);
    return constructor(sandbox.value);
});

exports.define(Boolean, function(value, constructor) {
    if (value === 'true' || typeof value === 'undefined') return constructor(true);
    if (value === 'false') return constructor(false);
    return constructor(!!value);
});

exports.define(Object, function(value, constructor) {
    var sandbox = {value: null};
    vm.createContext(sandbox);
    vm.runInContext('value = ' + value, sandbox);
    return constructor(sandbox.value);
});



