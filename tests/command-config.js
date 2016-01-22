var config              = require('../bin/command-config');
var expect              = require('chai').expect;

describe('command-config', function() {

    describe('aliasMap', function() {

        it('valid map', function() {
            var map = {
                apple: { alias: 'a' },
                banana: { alias: 'b' },
                carrot: { alias: 'c' }
            };
            expect(config.aliasMap(map)).to.be.deep.equal({ a: 'apple', b: 'banana', c: 'carrot' });
        });

        it('map with duplicate aliases', function() {
            var map = {
                apple: {alias: 'a'},
                apricot: {alias: 'a'},
                banana: {alias: 'b'},
                carrot: {alias: 'c'}
            };
            try {
                config.aliasMap(map);
            } catch (e) {
                expect(e).to.be.instanceof(config.error.aliasConflict);
                expect(e.conflict.indexOf('apple')).to.not.be.equal(-1);
                expect(e.conflict.indexOf('apricot')).to.not.be.equal(-1);
            }
        });

    });

    describe('defaultTransform', function() {

        it('is function', function() {
            expect(config.defaultTransform).to.be.a('function');
        });

    });

    describe('defaultValidate', function() {

        it('is function', function() {
            expect(config.defaultValidate).to.be.a('function');
        });

    });

    describe('normalizeOption', function() {

        describe('invalid parameter', function() {

            it('null', function() {
                expect(function() {
                    config.normalizeOption(null);
                }).to.throw(config.error.invalid);
            });

            it('string', function() {
                expect(function() {
                    config.normalizeOption('str');
                }).to.throw(config.error.invalid);
            });

            it('number', function() {
                expect(function() {
                    config.normalizeOption(5);
                }).to.throw(config.error.invalid);
            });

            it('boolean', function() {
                expect(function() {
                    config.normalizeOption(true);
                }).to.throw(config.error.invalid);
            });

        });

        it('all properties', function() {
            var input = {
                alias: 'n',
                defaultValue: 0,
                description: 'A number to add to the sum.',
                group: 'math',
                hidden: false,
                multiple: true,
                required: false,
                transform: function(value) { return Math.abs(value); },
                type: Number,
                validate: function(value) { return !isNaN(value); }
            };
            expect(config.normalizeOption(input)).to.be.deep.equal(input);
        });

        it('no properties', function() {
            expect(config.normalizeOption({})).to.be.deep.equal(defaultBuild());
        });

        describe('defaultValue and required', function() {

            it('both', function() {
                expect(function() {
                    config.normalizeOption({ required: true, defaultValue: true });
                }).to.throw(config.error);
            });

            it('default value', function() {
                expect(function() {
                    config.normalizeOption({ defaultValue: true });
                }).to.not.throw(Error);
            });

            it('required false', function() {
                expect(function() {
                    config.normalizeOption({ required: false, defaultValue: true });
                }).to.not.throw(Error);
            });

            it('required true', function() {
                expect(function() {
                    config.normalizeOption({ required: true });
                }).to.not.throw(Error);
            });

        });

    });

    describe('normalizeOptions', function() {

        it('invalid parameter', function() {
            expect(function() {
                config.normalizeOption(null);
            }).to.throw(config.error.invalid);
        });

        it('defaults', function() {
            expect(config.normalizeOptions({ name: {}, age: {}})).to.be.deep.equal({
                name: defaultBuild(),
                age: defaultBuild()
            });
        });

    });

    describe('normalize', function() {
        var template = {
            brief: 'Get the absolute sum of numbers.',
            description: 'All numbers provided made positive and then added to the sum.',
            defaultOption: 'number',
            groups: {
                math: 'Math Options',
                message: 'Message Options'
            },
            options: {},
            sections: [
                {
                    title: 'Example 1',
                    body: 'This is an example.'
                }
            ],
            synopsis: [
                '[OPTIONS]...',
                '--number 5 -n 3 --message "Hello, World!"'
            ]
        };

        it('full options', function() {
            expect(config.normalize(template)).to.be.deep.equal(template);
        });

        it('invalid brief', function() {
            var input = Object.assign({}, template, { brief: {} });
            expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
        });

        it('invalid description', function() {
            var input = Object.assign({}, template, { description: {} });
            expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
        });

        it('invalid default option', function() {
            var input = Object.assign({}, template, { defaultOption: {} });
            expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
        });

        describe('invalid groups', function() {

            it('non-object', function() {
                var input = Object.assign({}, template, { groups: null });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

            it('value is number', function() {
                var input = Object.assign({}, template, { groups: { math: 5 } });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

            it('value is array', function() {
                var input = Object.assign({}, template, { groups: [] });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

        });

        describe('invalid options', function() {

            it('array', function() {
                var input = Object.assign({}, template, { options: [] });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

            it('null', function() {
                var input = Object.assign({}, template, { options: null });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

        });

        describe('invalid sections', function() {

            it('non-array', function() {
                var input = Object.assign({}, template, { sections: {} });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

            it('array item without title', function() {
                var input = Object.assign({}, template, { sections: [{ body: '' }] });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

            it('array item without body', function() {
                var input = Object.assign({}, template, { sections: [{ title: '' }] });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

        });

        describe('invalid synopsis', function() {

            it('object', function() {
                var input = Object.assign({}, template, { synopsis: {} });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

            it('array of non-string', function() {
                var input = Object.assign({}, template, { synopsis: [ {} ] });
                expect(function() { config.normalize(input); }).to.throw(config.error.invalid);
            });

        });

    });

});

function defaultBuild() {
    return {
        alias: '',
        description: '',
        group: '',
        hidden: false,
        multiple: false,
        required: false,
        transform: config.defaultTransform,
        type: Boolean,
        validate: config.defaultValidate
    }
}