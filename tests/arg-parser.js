var argParser           = require('../bin/arg-parser');
var test                = require('tape');

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
});