## Command Configuration Options

If you want your command to be able to accept command line arguments and process them then you must define the options property within the *command configuration*.

```js
var config = {
    description: '',
    defaultOption: 'foo',                   // Command line args without flag go to default option
    options: {                              // Command Configuration Options start here
        fooBar: {                           // "fooBar" is the flag name
            alias: '',
            defaultValue: undefined,
            description: '',
            env: '',
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

If the command line is camel cased `fooBar` then when you issue the command from the command line you'll use dashes for the option: `--foo-bar`.

### alias

A one letter string that specifies an alias flag that would be the same as using the full flag name.

### defaultValue

This property defines a default value to use if one is not specified through either the command line arguments or through an associated environment variable. If a default value is specified then required must be set to false, otherwise an error will be thrown.

### description

A detailed description of what the option does. The description can be a string or a function that returns a string. If a function is used then it will receive as its parameter an object that has the app name and command used, like so: `{ app: 'MyApp', command: 'my-command' }`.

### env

The environment variable name to use to populate the value if it was not specified through the command line arguments. If there is no value associated with the environment variable name then the value will not be set.

 If both a defaultValue and an env property are set then the environment variable will have a chance to set the value before the defaultValue is used.

### group

The name of the group that this option belongs to. The *command configuration* object must define groups and their associated titles before this option does anything.

### hidden

If set to true then the option will not appear in the help.

### multiple

A boolean value that specifies whether the option can receive more than one value. If set to false and the flag for this option is used more then once then only the last value will be kept. If set to true then the processed result will come back as an array of processed values for each time that the option's flag was used.

### required

Setting this property to true will cause the program to output a helpful error message when the option is not specified in the command line arguments and associated environment variable. Note that if this value is set to true that a defaultValue must not be defined otherwise an error will be thrown.

### transform

The transform function will be called after the *type* conversion and the *validate* test. It will receive the type casted value as a parameter and must return its replacement value. The replacement value will not be validated.

### type

The type specifies the parser that will be used to convert from the string supplied by the command line argument into its primitive or object value. Parsers that come standard with this module include: `Array`, `Boolean`, `Date`, `Number`, `String`, and `Object`. You can also [define your own custom parsers](parser.md).

### validate

The validate function is used to validate the value after it has had its *type* conversion. If this function returns false then a generic error message will be produced. If it returns a string then that string will be used to generate an error message. If it returns true then the validation passes.

## Env-File Option

The `env-file` option can be used to specify the file path to an environment configuration file. This file can be used in conjunction with an option's `env` property to define arguments through a file.

By default this functionality is disabled.

### Enabling the Env-File Option

You can turn off the `env-file` option for all commands through the settings:

```js
var Command = require('command-line-callback');
Command.settings.envFileOption = true;
```

Once enabled, if you do not want some commands to have the `env-file` option then you can disable it on a command by command basis by setting option to a falsy value.

```js
var Command = require('command-line-callback');

// enable env-file options
Command.settings.envFileOption = true;

// disable env-file option for this command
var configuration = {
    brief: 'A modified help option.',
    options: {
        envFile: false
    }
};

Command.define('noEnvFile', function(config) { ... }, configuration);

Command.evaluate();
```

## Help Option

The `help` option is enabled by default. When enabled:

1. A `--help` option is automatically added to each command.
2. Adding the `--help` flag to any command will output the help.

### Editing the Help Option

Even with the `help` option enabled by default, you can still modify the details of the option. Including the `--help` flag with the command will still output the help.

```js
var Command = require('command-line-callback');

var configuration = {
    brief: 'A modified help option.',
    options: {
        help: {
            alias: 'h',
            description: 'Get help',
            type: Boolean
        }
    }
};

Command.define('helpMod', function(config) { ... }, configuration);

Command.evaluate();
```

### Disabling the Help Option

You can turn off the `help` option for all commands through the settings:

```js
var Command = require('command-line-callback');
Command.settings.helpOption = false;
```

If you want to disable help for a single command, you can set the `help` option to a falsy value.

```js
var Command = require('command-line-callback');

var configuration = {
    brief: 'A command without help.',
    options: {
        help: false
    }
};

Command.define('helpless', function(config) { ... }, configuration);

Command.evaluate();
```

When the `help` option has been disabled, adding the `--help` flag to a command will not output the system help, even if the command had an option `help` defined.