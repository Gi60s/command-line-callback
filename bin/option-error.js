
module.exports = OptionError;

function OptionError(message) {
    this.name = 'OptionError';
    this.message = message || 'Option Error';
    this.stack = (new Error()).stack;
}
OptionError.prototype = Object.create(Error.prototype);
OptionError.prototype.constructor = OptionError;