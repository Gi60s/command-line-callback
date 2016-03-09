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

In situations where you have many arguments, you can specify groups for those options. You do not define groupings here (look at the options description for that) but here you do specify what the title (and potentially description) of each group should be. The value for this property should be an object where property names are the group name and the value is either the group title or an object with a title and a description.

For example, if you had defined groups in your options for `request` and `misc` then here you could define the groupings:

```js
{
    request: {
        title: 'Request Options',
        description: 'These options all relate to the request.'
    },
    misc: 'Miscelaneous Options'
}
```

The order in which groups are assigned titles will affect the order they come out in with the `--help`.

### options

This property is used to define what arguments your command will accept and process. [Read more about this on the command-configuration-options page](command-config-options.md).

### sections

The sections will only display when the `--help` flag is specified for this specific defined command. Each section will be displayed with a title and the content of the example. If the `beforeOptions` option is set then this section will appear before the options section, otherwise it will appear after the options section.

This property takes an array of objects that define the title and body of the section: `[{ title: 'Example title', body: 'Example body', beforeOptions: true }]`

### synopsis

The synopsis will output with the `--help` flag just below the help and description. The synopsis will describe how commands should be written for the command. This property takes an array of strings and for each string the name of the command will be prefixed to the synopsis string. Example: `[OPTIONS]... [URL]`