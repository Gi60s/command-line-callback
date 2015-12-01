var constructors            = require('./constructors');


module.exports = args;



function args(defaultOption, input) {
    var ar;
    var arg;
    var args = input || Array.prototype.slice.call(process.argv, 2);
    var current;
    var i;
    var map = {};
    var name;
    var unassigned = [];

    function create(name) {
        if (!map.hasOwnProperty(name)) map[name] = [ void 0 ];
        current = name;
    }

    function append(value) {
        var name = current ? current : defaultOption;
        if (!name) {
            unassigned.push(value);
        } else {
            if (!map.hasOwnProperty(name)) map[name] = [];
            if (map[name].length === 1 && typeof map[name][0] === 'undefined') map[name] = [];
            map[name].push(value);
        }
        current = false;
    }

    for (i = 0; i < args.length; i++) {
        arg = args[i];

        if (/=/.test(arg)) {
            ar = arg.split('=');
            arg = ar[0];
            args.splice(i + 1, 0, ar[1]);
        }

        if (/^-[a-z]/i.test(arg)) {
            arg = arg.substr(1).split('');
            arg.forEach(create);

        } else if (/^--[a-z]/i.test(arg)) {
            create(arg.substr(2));

        } else {
            append(arg);
        }
    }

    return {
        assignments: map,
        unassigned: unassigned
    };
}

args.defineConstructor = function(fnConstructor) {
    var index;
    if (typeof fnConstructor !== 'function') throw new Error('Defined constructor must be a function. Received: ' + fnConstructor);
    index = constructors.indexOf(fnConstructor);
    if (index === -1) constructors.push(fnConstructor);
};

args.options = function(configuration, defaultOption, input) {
    var aliasMap = {};
    var commandLineErrors = {};
    var data = args(defaultOption, input);
    var requires = {};
    var results = {};

    //configuration validation and normalization
    Object.keys(configuration).forEach(function(name) {
        var config = Object.assign({}, configuration[name]);

        //alias
        if (config.hasOwnProperty('alias')) {
            if (typeof config.alias !== 'string' || config.alias.length !== 1) {
                throw new Error('Option configuration "' + name +
                    '" "alias" must be a string of length 1. Received: ' +
                    config.alias);
            }
            aliasMap[config.alias] = name;
        }

        //description
        if (!config.hasOwnProperty('description')) config.description = '';
        if (typeof config.description !== 'string') {
            throw new Error('Option configuration "' + name +
                '" "description" must be a string. Received: ' + config.description);
        }

        //help
        if (!config.hasOwnProperty('help')) config.help = '';
        if (typeof config.help !== 'string') {
            throw new Error('Option configuration "' + name +
                '" "help" must be a string. Received: ' + config.help);
        }

        //multiple
        config.multiple = config.hasOwnProperty('multiple') ? !!config.multiple : false;

        //required
        config.required = config.hasOwnProperty('required') ? !!config.required : false;
        if (config.required) requires[name] = true;

        //transform
        if (!config.hasOwnProperty('transform')) config.transform = function(value, original) { return value };
        if (typeof config.transform !== 'function') {
            throw new Error('Option configuration "' + name +
                '" "transform" must be a function. Received: ' + config.transform);
        }

        //type
        if (!config.hasOwnProperty('type')) config.type = Boolean;
        if (typeof config.type !== 'function') {
            throw new Error('Option configuration "' + name +
                '" "type" must be a function. Received: ' + config.type);
        }

        //validator
        if (!config.hasOwnProperty('validator')) config.validator = function(value, original, args, config) { return true };
        if (typeof config.validator !== 'function') {
            throw new Error('Option configuration "' + name +
                '" "validator" must be a function. Received: ' + config.validator);
        }

        configuration[name] = config;
    });

    //acquire values
    Object.keys(data.assignments).forEach(function(name) {
        var config;
        var values = data.assignments[name];

        function typeConversion(value) {
            return constructors.run(config.type, value);
        }

        function transform(value, index) {
            return config.transform(value, values[index]);
        }

        function validate(value, index) {
            if (!config.validator(value, values[index], data, config)) {
                commandLineErrors[name] = 'validate';
                return void 0;
            }
            return value;
        }

        //get official name from alias
        if (aliasMap.hasOwnProperty(name)) name = aliasMap[name];

        //remove item from requires list
        if (requires[name]) delete requires[name];

        //get the value
        if (configuration.hasOwnProperty(name)) {
            config = configuration[name];

            results[name] = values
                .map(typeConversion)
                .map(transform)
                .map(validate);

            if (!config.multiple) results[name] = results[name][results[name].length - 1];
        }
    });

    //add default values
    Object.keys(configuration).forEach(function(name) {
        var option = configuration[name];
        if (option.hasOwnProperty('defaultValue') && !results.hasOwnProperty(name)) {
            results[name] = option.defaultValue;
            if (requires[name]) delete requires[name];
        }
    });

    //check for missing required values
    Object.keys(requires).forEach(function(name) {
        commandLineErrors[name] = 'required';
    });

    return {
        errors: Object.keys(commandLineErrors).length > 0 ? commandLineErrors : null,
        options: results
    };
};