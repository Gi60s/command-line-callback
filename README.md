```[![view on npm](http://img.shields.io/npm/v/command-line-callback.svg)](https://www.npmjs.org/package/command-line-callback)```
```[![npm module downloads](http://img.shields.io/npm/dt/command-line-callback.svg)](https://www.npmjs.org/package/command-line-callback)```

# command-line-callback

Create git-style command structure that calls functions within your application. Defined commands can also produce help output when the `--help` flag is used.

## Usage Example

```js
var Command = require('command-line-callback');
var configuration = { ... };        // look at Configuration section for details

function runApp(options) {}

Command.define('run', runApp, configuration);

Command.evaluate();                 // evaluate the command line args to call a command
```

## Working Example

[Look at a complete working example](readme/math-example.md)

## API

### define ( commandName, callback [, configuration ] )

Define a git-style command, the function it should call, and the configuration options that link the command line to the callback.

**Parameters**

- **commandName** - The name of the command.
- **callback** - The function to call once the command line arguments have been parsed. This funciton will receive one parameter: an object that represents the values from the command line arguments.
- **configuration** - The command configuration. [Read up on the details of the configuration](readme/command-config.md).

**Returns** undefined.

### evaluate ( [ args ] )

Evaluate input arguments to determine which command to run and with what options. The result will be logged to the console.

**Parameters**

- **args** - This optional parameter must be an array of strings. If not supplied then it will use the command line arguments used to start the application.

**Returns** undefined.

### execute ( commandName, options )

Execute a defined command from within your code.

**Parameters**

- **commandName** - The name of the command.
- **options** - An object with key value pairs to pass to the command callback. This object will have it's values validated and transformed, but the values will not go through the type parser.
 
**Returns** whatever the command returns.

### getCommandUsage ( commandName )

Get the help string for the command specified.

**Parameters**

- **commandName** - The name of the command.
 
**Returns** a string with the command's help.

### list ( )

Get the names of all defined commands.
 
**Returns** a string with the command's help.

## parser

The parser is the tool that is used to convert string values into primitives or objects. This tool is uses by the command line args tool to convert strings from the command line into usable values.

### parser.define ( factory, emptyReplacement [, parser ] )

Define a parser that converts the a string into its value equivalent.

**Parameters**

- **factory** - The function that will take parameters to make an instance.
- **emptyReplacement** - If the value is an empty string, this string value will be used to replace the empty string prior to conversion.
- **parser** - A function that parses the string value before calling the factory to create the instance. If this parameter is omitted then the factory will be called with the string value as its only parameter.

**Returns** undefined.

**Example**

```js
var command = require('command-line-callback');
command.parser.define(Boolean, 'true', function(value, factory) {
    // Note: factory === Boolean
    if (value === 'true') return factory(true);
    if (value === 'false') return factory(false);
    if (!isNaN(value)) return factory(parseInt(value));
    return factory(!!value);
});
```

### parser.exists ( factory )

Check if the parser has been defined.

**Parameters**

- **factory** - The function that will take parameters to make an instance.

**Returns** a boolean.

### parser.parse ( factory, value )

Parse and string value and get back its instance value.

**Parameters**

- **factory** - The function that will take parameters to make an instance.
- **value** - A string value to parse.

**Returns** the value that the factory produces.

**Example**

```js
var value = command.parser.parse(Boolean, '');  // true
```