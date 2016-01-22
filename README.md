```[![view on npm](http://img.shields.io/npm/v/command-line-callback.svg)](https://www.npmjs.org/package/command-line-callback)```
```[![npm module downloads](http://img.shields.io/npm/dt/command-line-callback.svg)](https://www.npmjs.org/package/command-line-callback)```

# command-line-callback

Create git-style command structure that calls functions within your application. Defined commands can also produce help output when the `--help` flag is used.

## Define a Command

```js
var Command = require('command-line-callback');
var configuration = { ... };        // look at Configuration section for details

Command.define('run', runApp, configuration);

function runApp(options) {

}
```

## Command Configuration

Configurations are used to define how command line arguments should be interpreted to create meaningful data. This is how a default configuration looks.

```js
{
    brief: '',
    description: '',
    defaultOption: '',
    groups: {},
    options: {},
    sections: {},
    synopsis: []
}
```

### brief

This property defines a short description of what the command does. If the `--help` flag is issued on your application without a command or if your application is run without a command then a list of all commands and their description will be output to the console.

### description

This property is a string that provides any additonal instructions for the command. It will appear immediately below the description when the `--help` flag is used.

### defaultOption

When the command line arguments are being parsed, any flags that aren't associated with a specific option will be assigned to the option specified here.

### groups

In situations where you have many arguments, you can specify groups for those options. You do not define groupings here (look at the options description for that) but here you do specify what the title of each group should be. The value for this property should be an object where property names are the group name and the value is the group title. For example: `{ request: 'Request Options', misc: 'Miscelaneous Options' }`.

The order in which groups are assigned titles will affect the order they come out in with the `--help`.

### options

This property is used to define what arguments your command will accept and process. There are a lot of details on this property, so look to the *Command Configuration Options* section.

### sections

The sections will only display when the `--help` flag is specified for this specific defined command. Each section will be displayed with a title and the content of the example. If the `beforeOptions` option is set then this section will appear before the options section, otherwise it will appear after the options section.

This property takes an array of objects that define the title and body of the section: `[{ title: 'Example title', body: 'Example body', beforeOptions: true }]`

### synopsis

The synopsis will output with the `--help` flag just below the help and description. The synopsis will describe how commands should be written for the command. This property takes an array of strings and for each string the name of the command will be prefixed to the synopsis string. Example: `[OPTIONS]... [URL]`

## Command Configuration Options

If you want your command to be able to accept command line arguments and process them then you must define the options property within the *command configuration*.

```js
var config = {
    description: '',
    defaultOption: 'foo',                   // Command line args without flag go to default option
    options: {                              // Command Configuration Options start here
        foo: {                              // "foo" is the flag name
            alias: '',
            defaultValue: undefined,
            description: '',
            group: '',
            hidden: false,
            multiple: false,
            required: false,
            transform: function(v) { return v; },
            type: Boolean,
            validate: function(v) { return true; }
        }
    }
}
```

### alias

A one letter string that specifies an alias flag that would be the same as using the full flag name.

### defaultValue

If this property is included, regardless of the value it contains, then its value will be used to populate one parsed value when no flag for this option is used in the command line arguments. If a default value is specified then required must be set to false, otherwise an error will be thrown.

### description

A detailed description of what the option does.

### group

The name of the group that this option belongs to. The *command configuration* object must define groups and their associated titles before this option does anything.

### hidden

If set to true then the option will not appear in the help.

### multiple

A boolean value that specifies whether the option can receive more than one value. If set to false and the flag for this option is used more then once then only the last value will be kept. If set to true then the processed result will come back as an array of processed values for each time that the option's flag was used.

### required

Setting this property to true will cause the program to output a helpful error message when the option is not specified in the command line arguments. Note that if this value is set to true that a defaultValue must not be defined otherwise an error will be thrown.

### transform

The transform function will be called after the *type* conversion and the *validate* test. It will recieve the type casted value as a parameter and must return its replacement value. The replacement value will not be validated.

### type

The type specifies the parser that will be used to convert from the string supplied by the command line argument into its primitive or object value. Parsers that come standard with this module include: `Array`, `Boolean`, `Date`, `Number`, `String`, and `Object`. You can also [define your own custom parsers]('./readme/parser.md).

### validate

The validate function is used to validate the value after it has had its *type* conversion. If this function returns false then a generic error message will be produced. If it returns a string then that string will be used to generate an error message. If it returns true then the validation passes.