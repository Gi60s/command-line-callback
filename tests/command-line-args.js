var args                = require('../bin/command-line-args');
var expect              = require('chai').expect;

describe('command-line-args', function() {

    var config = {
        defaultOption: 'def',
        options: {
            name: {
                type: String,
                defaultValue: 'mark'
            },
            bool: {
                type: Boolean
            },
            age: {
                type: Number,
                multiple: true
            },
            gender: {
                alias: 'g',
                type: String
            },
            color: {
                alias: 'c',
                type: String,
                multiple: true
            },
            def: {
                type: String,
                multiple: true
            }
        }
    };

    describe('map', function() {

        it('identifies aliases', function() {
            var input = ['-g', 'male', '-c', 'red', '-c', 'blue'];
            var output = {
                gender: ['male'],
                color: ['red', 'blue']
            };
            expect(args.map(config, input)).to.be.deep.equal(output);
        });

        it('ignores unknown flags', function() {
            var input = ['--foo', '-x'];
            var output = {};
            expect(args.map(config, input)).to.be.deep.equal(output);
        });

        it('ignores types', function() {
            var input = ['--age', '5', '--bool', '--bool', 'false'];
            var output = {
                age: ['5'],
                bool: ['', 'false']
            };
            expect(args.map(config, input)).to.be.deep.equal(output);
        });

        it('ignores multiples option', function() {
            var input = ['--name', 'jack', '--name', 'bob', '--age', '5', '--age', '10', '--age', '--age'];
            var output = {
                name: ['jack', 'bob'],
                age: ['5', '10', '', '']
            };
            expect(args.map(config, input)).to.be.deep.equal(output);
        });

        it('loads defaults', function() {
            var input = ['first', '--age', '5', 'second', '--age', '10', 'third', 'last'];
            var output = {
                age: ['5', '10'],
                def: ['first', 'second', 'third', 'last']
            };
            expect(args.map(config, input)).to.be.deep.equal(output);
        });

        it('camel cases', function() {
            var config = {
                options: {
                    firstName: {},
                    lastName: {}
                }
            };
            var input = ['--first-name', 'Bob', '--last-name', 'Smith'];
            var output = {
                firstName: ['Bob'],
                lastName: ['Smith']
            };
            expect(args.map(config, input)).to.be.deep.equal(output);
        });

        describe('weird arguments', function() {

            it('=', function() {
                var input = ['--name', 'a=b'];
                expect(args.map(config, input)).to.be.deep.equal({ name: ['a=b'] });
            });

            it('?', function() {
                var input = ['--name', 'a?b'];
                expect(args.map(config, input)).to.be.deep.equal({ name: ['a?b'] });
            });

        })

    });

    describe('options', function() {

        it('sets defaults', function() {
            var input = [];
            var output = {
                name: 'mark'
            };
            expect(args.options(config, input)).to.be.deep.equal(output);
        });

        it('converts data', function() {
            var input = ['--age', '10'];
            var output = {
                name: 'mark',
                age: [10]
            };
            expect(args.options(config, input)).to.be.deep.equal(output);
        });

        it('manages multiples', function() {
            var input = ['--name', 'john', '--name', 'alice', '--age', '5', '--age', '10'];
            var output = {
                name: 'alice',
                age: [5, 10]
            };
            expect(args.options(config, input)).to.be.deep.equal(output);
        });

        it('handles empty values', function() {
            var input = ['--age', '--age', '10', '--bool'];
            var output = {
                name: 'mark',
                bool: true,
                age: [0, 10]
            };
            expect(args.options(config, input)).to.be.deep.equal(output);
        });

        it('handles defaults', function() {
            var input = ['first', '--age', '10', 'second', '--bool', 'false', 'third', 'last'];
            var output = {
                name: 'mark',
                bool: false,
                age: [10],
                def: ['first', 'second', 'third', 'last']
            };
            expect(args.options(config, input)).to.be.deep.equal(output);
        })

    });

});
