# command-line-callback

## command.parser

The parser is the tool that is used to convert string values into primitives or objects. This tool is uses by the command line args tool to convert strings from the command line into usable values.

### define ( factory, emptyReplacement [, parser ] )

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

### exists ( factory )

Check if the parser has been defined.

**Parameters**

- **factory** - The function that will take parameters to make an instance.

**Returns** a boolean.

### parse (factory, value)

Parse and string value and get back its instance value.

**Parameters**

- **factory** - The function that will take parameters to make an instance.
- **value** - A string value to parse.

**Returns** the value that the factory produces.

**Example**

```js
var value = command.parser.parse(Boolean, '');  // true
```