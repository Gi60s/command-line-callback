
exports.boolean = function(value) {
    return typeof value === 'boolean' || value instanceof Boolean;
};

exports.function = function(value) {
    return typeof value === 'function' || value instanceof Function;
};

exports.number = function(value) {
    return typeof value === 'number' || value instanceof Number;
};

exports.object = function(value) {
    return typeof value === 'object' || value instanceof Object;
};

exports.string = function(value) {
    return typeof value === 'string' || value instanceof String;
};

exports.symbol = function() {
    return typeof value === 'symbol';
};