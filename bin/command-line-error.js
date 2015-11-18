
module.exports = CommandLineError;

function CommandLineError(message) {
    this.name = 'CommandLineError';
    this.message = message || '';
    this.stack = (new Error()).stack;
}
CommandLineError.prototype = Object.create(Error.prototype);
CommandLineError.prototype.constructor = CommandLineError;