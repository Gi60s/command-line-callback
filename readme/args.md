# command-line-callback

## command.args

A tool for evaluating command line arguments.

### args

Get an array of strings for the arguments used to start the application. This will not include the name of the command included with the command line arguments. If the application was started like with `$ node app.js myCmd --foo bar` then the result of getting this property's value would be `["--foo", "bar"]`.

### command

Get the command that was issued through the command line. If the application was started like with `$ node app.js myCmd --foo bar` then the result of getting this property's value would be `"myCmd"`.

### map (configuration, args)

Take an array of strings that represent command line args and take a configuration object to generate a map of values. The configuration object must be a command configuration object, although only the defaultOption property is used and among the options only the alias is taken into account.

**Parameters**

- **configuration** - A command configuration object.
- **args** - An array of strings.

**Returns** an object that has keys and values mapped.

**Example**

```js
var config = {
    defaultOption: 'def',
    options: {
        firstName: { },
        bool: { },
        age: { alias: 'a' },
        def: { }
    }
};

var args = ['--first-name', 'Bob', '--bool', '--age', '5', '-a', '10', '--bool', 'false', 'foo', 'bar'];

var map = command.args(config, args);

/*
Map contains:
{
    firstName: ['Bob'],
    bool: ['', 'false'],
    age: ['5', '10'],
    def: ['foo', 'bar']
}
*/
```

### options (configuration, args [, optionsOnly ])

Take an array of strings that represent the command line arguments and a command configuration to generate a normalized configuration object.

**Parameters**

- **configuration** - A command configuration object.
- **args** - An array of strings.
- **optionsOnly** - If there are errors with the arguments then an error will be thrown unless this value is set to `false`. By setting this value to `false` an object containing the options and errors encountered will be returned. Defaults to `true`.

**Returns** a normalized object configuration unless *optionsOnly* is set to `false`, in which case an object containing the options and errors is returned. For example:

```js
{
    options: {},    // normalized configuration
    errors: []      // array of strings describing errors
}
```

**Example**

```js
var config = {
    defaultOption: 'def',
    options: {
        bool: { type: Boolean },
        name: { type: String, defaultValue: 'Tom' },
        age: { type: Number, alias: 'a', multiple: true },
        def: { type: String, multiple: true }
    }
};

var args = ['--bool', '--age', '5', '-a', '10', '--bool', 'false', 'foo', 'bar'];

var map = command.options(config, args);

/*
Map contains:
{
    name: 'Tom',
    bool: false,
    age: [5, 10],
    def: ['foo', 'bar']
}
*/
```