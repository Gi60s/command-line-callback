var ap                  = require('../bin/parser');
var expect              = require('chai').expect;

describe('value-parser', function() {

    describe('define', function() {

        after(ap.reset);
        beforeEach(ap.reset);

        describe('validates parameters', function() {

            it('function, string, function', function() {
                expect(function() {
                    ap.define(String, '', function() {});
                }).to.not.throw(Error);
            });

            it('not function, string, function', function() {
                try {
                    ap.define('', '', function() {});
                    throw new Error('Should not pass');
                } catch (e) {
                    expect(e).to.be.instanceof(ap.error.param);
                    expect(e.code).to.be.equal('EPARAM');
                    expect(e.name).to.be.equal('factory');
                }
            });

            it('function, not string, function', function() {
                try {
                    ap.define(String, {}, function() {});
                    throw new Error('Should not pass');
                } catch (e) {
                    expect(e).to.be.instanceof(ap.error.param);
                    expect(e.code).to.be.equal('EPARAM');
                    expect(e.name).to.be.equal('undefinedReplacement');
                }
            });

            it('function, string, not function', function() {
                try {
                    ap.define(String, '', {});
                    throw new Error('Should not pass');
                } catch (e) {
                    expect(e).to.be.instanceof(ap.error.param);
                    expect(e.code).to.be.equal('EPARAM');
                    expect(e.name).to.be.equal('parser');
                }
            });

        });

    });

    describe('exists', function() {
        function Custom(value) {}

        after(ap.reset);
        beforeEach(ap.reset);

        it('array', function() {
            expect(ap.exists(Array)).to.be.equal(true);
        });

        it('boolean', function() {
            expect(ap.exists(Boolean)).to.be.equal(true);
        });

        it('date', function() {
            expect(ap.exists(Date)).to.be.equal(true);
        });

        it('number', function() {
            expect(ap.exists(Number)).to.be.equal(true);
        });

        it('string', function() {
            expect(ap.exists(String)).to.be.equal(true);
        });

        it('object', function() {
            expect(ap.exists(Object)).to.be.equal(true);
        });

        it('custom', function() {
            ap.define(Custom, 'null', function(value, factory) {});
            expect(ap.exists(Custom)).to.be.equal(true);
        });

    });

    describe('array', function() {

        it('empty array', function() {
            expect(ap.parse(Array, '[]')).to.be.deep.equal([]);
        });

        it('non-empty array', function() {
            expect(ap.parse(Array, '[ 1, 2, [ "a", "b" ]]')).to.be.deep.equal([ 1, 2, ['a', 'b']]);
        });

    });

    describe('boolean', function() {

        it('"true"', function() {
            expect(ap.parse(Boolean, 'true')).to.be.true;
        });

        it('"false"', function() {
            expect(ap.parse(Boolean, 'false')).to.be.false;
        });

        it('zero', function() {
            expect(ap.parse(Boolean, '0')).to.be.false;
        });

        it('one', function() {
            expect(ap.parse(Boolean, '1')).to.be.true;
        });

        it('empty string', function() {
            expect(ap.parse(Boolean, '')).to.be.true;
        });

        it('json string', function() {
            expect(ap.parse(Boolean, '{}')).to.be.true;
        });

    });

    describe('date', function() {

        it('zero', function() {
            var d = ap.parse(Date, '0');
            expect(d).to.be.instanceof(Date);
            expect(d.getTime()).to.be.equal(0);
        });

        it('2000-01-02 12:00:01', function() {
            var d = new Date(2000, 0, 2, 12, 0, 1);
            expect(ap.parse(Date, '2000-01-02 12:00:01').getTime()).to.be.equal(d.getTime());
        });

    });

    describe('number', function() {

        it('zero', function() {
            expect(ap.parse(Number, '0')).to.be.equal(0);
        });

        it('one', function() {
            expect(ap.parse(Number, '1')).to.be.equal(1);
        });

        it('negative one', function() {
            expect(ap.parse(Number, '-1')).to.be.equal(-1);
        });

        it('not-number', function() {
            expect(ap.parse(Number, 'abc').toString()).to.be.equal('NaN');
        });

    });

    describe('string', function() {

        it('abc', function() {
            expect(ap.parse(String, 'abc')).to.be.equal('abc');
        });

    });

    describe('object', function() {

        it('empty object', function() {
            expect(ap.parse(Object, '{}')).to.be.deep.equal({});
        });

        it('non empty object', function() {
            expect(ap.parse(Object, '{ a: 1, b: { c: "d", e: [ 3 ] } }')).to.be.deep.equal({ a: 1, b: { c: "d", e: [ 3 ] } });
        });

    });

});
/*

test('Can parse array', function(t) {
    var parse = argParser.get(Array);
    t.ok(typeof parse === 'function', 'Found Array parser');

    t.deepEqual(parse('[]'), [], 'Empty array');
    t.deepEqual(parse('2'), ['2'], 'Numeric string');
    t.deepEqual(parse('Hello'), ['Hello'], 'Hello string');

    t.end();
});

test('Can parse boolean', function(t) {
    var parse = argParser.get(Boolean);
    t.ok(typeof parse === 'function', 'Found Boolean parser');

    t.equal(parse('true'), true, '"true" is true');
    t.equal(parse('1'), true, '"1" is true');
    t.equal(parse('foo'), true, '"foo" is true');

    t.equal(parse('false'), false, '"false" is false');
    t.equal(parse('0'), false, '"0" is false');
    t.equal(parse(''), false, '"" is false');

    t.end();
});

test('Can parse Date', function(t) {
    var parse = argParser.get(Date);
    t.ok(typeof parse === 'function', 'Found Date parser');

    t.equal(parse('0').valueOf(), new Date(0).valueOf(), '"0" is Wed Dec 31 1969 17:00:00 GMT-0700 (MST)');

    t.end();
});

test('Can parse number', function(t) {
    var parse = argParser.get(Number);
    t.ok(typeof parse === 'function', 'Found Number parser');

    t.equal(parse('0'), 0, '"0" is 0');
    t.equal(parse('1'), 1, '"1" is 1');
    t.equal(parse('1.35'), 1.35, '"1.35" is 1.35');
    t.equal(parse('-1'), -1, '"-1" is -1');
    t.ok(isNaN(parse('true')), '"true" is NaN');

    t.end();
});

test('Can parse object', function(t) {
    var parse = argParser.get(Object);
    t.ok(typeof parse === 'function', 'Found Object parser');

    t.deepEqual(parse('{}'), {}, 'Empty object');
    t.deepEqual(parse('{ name: "Bob", age: 5, prop: { ok: true } }'), { name: "Bob", age: 5, prop: { ok: true } }, 'Deep object');
    t.equal(parse('null'), null, 'Null object');

    t.end();
});*/
