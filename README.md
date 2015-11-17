# Command Line Callback

This module makes it easier to implement a command line interface with a NodeJS application. It supports the following command structures:

    //local module
    node myApp.js [COMMAND] [OPTIONS]...
    
    //global module
    myApp [COMMAND] [OPTIONS]...

The [COMMAND] specified is linked to a callback that will get called once all [OPTIONS] have been evaluated.

Additionally, this module implements a documenting feature where descriptions of commands and options can easily be viewed in the terminal.

##Installation

The easiest way to install this module is using npm.

	npm install command-line-callback

## Examples

### Define and Call Command

	//require the module
	var clc = require('command-line-callback');
	
	//define your function that will get called
	var callback = function(options) {
		//...
	};
	
	//define the command's configuration
	var configuration = {
		description: 'This calls my command',
		options: []
	};
	
	//define the command: 'myCommand'
	clc.define('myCommand', callback, configuration);

If you saved this in a file named app.js then you'd be able to execute the code in the callback by typing the following into the terminal:

	node app.js myCommand

### Get Help for a Defined Command

For details on what options are available for a specific command:

	node app.js myCommand --help

### Get General Help for All Commands

Either one of these commands will output basic help for all defined commands:

	node app.js
	node app.js --help

## API

The API has several methods that will help you to define and call commands.

### evaluate

**evalute()**

Evaluate the command line args that were used to start the application and call the associated command. Any output will be sent to the console.

#### Example

	require('command-line-callback').evaluate();

### define

**define(commandName, callback, [configuration])**

Define a command that should be accessible from the command line by using the specified command name.

#### Parameters
 - commandName {string} - The name of the command as it will be called from the command line.
 - callback {function} - The function to call to execute the command. This function will receive one parameter, an object, that has all of the options that were passed in with their processed values.
 - configuration {object} - An object defining how the command works and what options are available to it. If this parameter is omitted then your command will not have any options available to it. For a full explanation of the configuration, please see the configuration section below.

#### Example

	//require the module
	var clc = require('command-line-callback');
	
	//define your function that will get called
	var callback = function(options) {
		//...
	};
	
	//define the command's configuration
	var configuration = {
		description: 'This calls my command',
		options: []
	};
	
	//define the command: 'myCommand'
	clc.define('myCommand', callback, configuration);

### execute

**execute(commandName, [options])**

Execute a defined command with the options supplied. The options will be processed before being sent to the command.

#### Parameters

 - commandName {string} - The name of the command to execute.
 - options {object} - The options to pass into the command

#### Returns

 - {*} - Returns whatever the command returns.

#### Example

	var clc = require('command-line-callback');
	clc.execute('myCommand', { value: true });

### getUsage

**getUsage([commandName])**

Get usage help.

#### Parameters

 - commandName {string} - If specified then the usage information for that particular command will be returned. If omitted then general information for all commands will be returned.

#### Returns
 - {string} - A string that has usage details.

#### Example

	var clc = require('command-line-callback');
	clc.getUsage('myCommand');

### help

**help([commandName])**

Get usage help. This is an alias for getUsage().

#### Parameters

 - commandName {string} - If specified then the usage information for that particular command will be returned. If omitted then general information for all commands will be returned.

#### Returns
 - {string} - A string that has usage details.

#### Example

	var clc = require('command-line-callback');
	clc.help('myCommand');

### list

**list([commandsOnly])**

Get a list of defined commands, optionally limited to only non-aliases.

#### Parameters

 - commandsOnly {boolean} - Set to true to return only commands (not command aliases). Defaults to false.

#### Returns

 - {string[]} - An array of strings, listing each defined command.

## Configuration Object

The configuration object defines the usage for a command and it is also used to provide command help.

The structure of this configuration object is founded on the configuration for the [command-line-args](https://www.npmjs.com/package/command-line-args) module which is founded on the [command-line-usage](https://www.npmjs.com/package/command-line-usage) module. To understand how to configure those options in detail, you'll want to visit the pages for those modules.

Beyond that foundational configuration here are a few things you need to know:

 1. You should not include the title property because it will automatically be set to the command name.
 2. You should create a property named *options* and define the command-line-args configuration within that property.
 3. You can add a property named *alias" that takes an array of strings to define commands that point to this same command.

### Example

	{
		alias: ['alternateCommandName'],
		description: 'a description of what the command does',
		options:[
			{
				name: 'verbose',
				alias: 'v',
				type: Boolean
			},
			{
				name: 'src',
				type: String, multiple: true,
				defaultOption: true
			},
			{
				name: 'timeout',
				alias: 't',
				type: Number
			}
		]		
	}