'use strict';
const fs    = require('fs');

module.exports = function(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    try {
        return JSON.parse(content);
    } catch (e) {
        const result = {};
        content.split('\n')
            .forEach(function(line) {
                const match = line.match(/^(.+?)[=:](.*)$/);
                if (match) {
                    const key = trim(match[1]);
                    const value = trim(match[2]);
                    if (!result.hasOwnProperty(key)) result[key] = [];
                    result[key].push(value);
                }
            });
        return result;
    }
};

function trim(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
}