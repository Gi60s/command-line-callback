
module.exports = wordWrap;

function wordWrap(content, config) {
    var available;
    var format = null;
    var length;
    var next;
    var options;
    var result = '';
    var sep;
    var str;
    var word;
    var words = splitContentIntoWords(content);
    var wordsOnLine = 0;
    var x = 1;
    var y = 1;

    //normalize options
    options = Object.assign({
        firstLineIndent: 0,         //the left side indent for the first line
        hangingLineIndent: 0,       //the left side indent for all but the first line
        hyphenateThreshold: 3,      //the minimum number of characters to have on each line before automatic
                                    //hyphenation will occur for line overflow
        hyphenateWordLength: 11,    //how long a word must be before automatic hyphenation for line overflow
                                    //set to 0 (zero) to stop automatic hyphenation
        lineLength: 80              //the length of the line (before word wrap)
    }, config);

    //first line indent
    result += makeSpaces(options.firstLineIndent);
    x = options.firstLineIndent;
    available = options.lineLength - x;

    while (next = words.shift()) {
        sep = next.sep;
        word = next.word;
        format = next.format;
        length = next.length;

        //word plus separator fit on the current line
        if (length <= available) {
            if (sep !== '\n') {
                addToLine(word + sep, length);
            } else {
                addToLine(word, length - 1);
                newLine();
            }

        //separator is space and word without separator fits on the current line
        } else if (sep === ' ' && length - 1 <= available) {
            addToLine(word, length - 1);
            newLine();

        //word can be automatically hyphenated
        } else if (length >= options.hyphenateWordLength && length >= options.hyphenateThreshold * 2) {
            unshift(word.substr(available - 1), sep);
            unshift(word.substr(0, available - 1), '-');

        //cannot hyphenate but word will fit on the next line by itself
        } else if (length + options.hangingLineIndent <= options.lineLength && wordsOnLine) {
            newLine();
            unshift(word, sep);

        //force line split - word exceeds line length
        } else {
            unshift(word.substr(options.lineLength), '');
            unshift(word.substr(0, options.lineLength), '');
        }

    }



    function addToLine(str) {
        result += str;
        x += str.length;
        available = options.lineLength - x;
        wordsOnLine = true;
    }

    function newLine() {
        if (format) result += format.unicode + '[0m';
        result += '\n' + makeSpaces(options.hangingLineIndent);
        if (format) result += format.format;
        y++;
        x = options.hangingLineIndent;
        available = options.lineLength - x;
        wordsOnLine = false;
    }

    function unshift(word, sep) {
        var length;
        var rx =/^(?:\033|\x1B|\e|\u001b)/;
        length = word.length;
        if (sep && !rx.test(sep)) length += sep.length;
        words.unshift({ word: word, sep: sep, length: length, format: format });
    }

    return result;
}

wordWrap.bold = function(str) {
    return '\033[1m' + str + '\033[0m';
};

wordWrap.boldUnderline = function(str) {
    return '\033[1;4m' + str + '\033[0m';
};

wordWrap.italic = function(str) {
    return '\033[3m' + str + '\033[0m';
};

wordWrap.underline = function(str) {
    return '\033[4m' + str + '\033[0m';
};

wordWrap.makeSpaces = makeSpaces;






function makeSpaces(num) {
    var str = '';
    var i;
    for (i = 0; i < num; i++) str += ' ';
    return str;
}

function splitContentIntoWords(content) {
    var ch;
    var currIndex;
    var format = null;
    var i;
    var indexes = [];
    var match;
    var result = [];
    var rx = /(\033|\x1B|\e|\u001b)\[((?:\d+;)*\d+)m/gm;
    var word = '';

    //replace single carriage returns with new lines and carriage return plus new line with new lines
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    //find formatting instructions
    while (match = rx.exec(content)) {
        indexes.push({
            format: match[0],
            index: match.index,
            unicode: match[1],
            value: match[2]
        });
    }

    //set the starting index
    currIndex = indexes.shift();

    //begin splitting string into words
    for (i = 0; i < content.length; i++) {
        if (currIndex && currIndex.index === i) {
            format = currIndex.value === '0' ? null : currIndex;
            result.push({ word: word, sep: currIndex.format, length: word.length, format: format });
            word = '';
            i += currIndex.format.length - 1
            currIndex = indexes.shift();
        } else {
            ch = content.substr(i, 1);
            switch (ch) {
                case '\n':
                case ' ':
                case '-':
                    result.push({ word: word, sep: ch, length: word.length + ch.length, format: format });
                    word = '';
                    break;
                default:
                    word += ch;
            }
        }
    }

    //push the last word onto the array
    result.push({ word: word, sep: '', length: word.length, format: format });

    return result;
}