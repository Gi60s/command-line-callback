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

If this property is included, regardless of the value it contains, then its value will be used to populate one parsed value when no flag for this option is used in the command line arguments. If a default value is specified then required must be set to false, otherwise an error will be thrown.

### description

A detailed description of what the option does. The description can be a string or a function that returns a string. If a function is used then it will receive as its parameter an object that has the app name and command used, like so: `{ app: 'MyApp', command: 'my-command' }`.

### group

The name of the group that this option belongs to. The *command configuration* object must define groups and their associated titles before this option does anything.

### hidden

If set to true then the option will not appear in the help.

### multiple

A boolean value that specifies whether the option can receive more than one value. If set to false and the flag for this option is used more then once then only the last value will be kept. If set to true then the processed result will come back as an array of processed values for each time that the option's flag was used.

### required

Setting this property to true will cause the program to output a helpful error message when the option is not specified in the command line arguments. Note that if this value is set to true that a defaultValue must not be defined otherwise an error will be thrown.

### transform

The transform function will be called after the *type* conversion and the *validate* test. It will receive the type casted value as a parameter and must return its replacement value. The replacement value will not be validated.

### type

The type specifies the parser that will be used to convert from the string supplied by the command line argument into its primitive or object value. Parsers that come standard with this module include: `Array`, `Boolean`, `Date`, `Number`, `String`, and `Object`. You can also [define your own custom parsers](parser.md).

### validate

The validate function is used to validate the value after it has had its *type* conversion. If this function returns false then a generic error message will be produced. If it returns a string then that string will be used to generate an error message. If it returns true then the validation passes.