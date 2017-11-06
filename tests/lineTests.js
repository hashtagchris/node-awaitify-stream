// Test reading lines using byline.
const fs = require('fs');
const byline = require('byline');
const aw = require('../lib/awaitify-stream.js');

function checkResults(lines, expectedLines) {
    if (lines.length !== expectedLines.length) {
        throw new Error(`Expected ${expectedLines.length} lines. Actual: ${lines.length}`);
    }

    for (let i = 0; i < expectedLines.length; i++) {
        if (lines[i] !== expectedLines[i]) {
            throw new Error(`Line ${i + 1}: Expected '${expectedLines[i]}'. Actual: ${lines[i]}`);
        }
    }
}

async function readFile(testFile, expectedLines) {
    console.log(`*** Opening ${testFile} for reading.`);

    let readStream = fs.createReadStream(testFile);
    let lineStream = byline.createStream(readStream, { keepEmptyLines: true });
    let reader = aw.createReader(lineStream);

    let line;
    let lines = [];
    while (null !== (line = await reader.readAsync())) {
        // convert Buffer to string.
        line = line.toString();
        lines.push(line);

        console.log(`Line: ${line}`);
    }

    console.log('*** Done reading.');

    return lines;
}

async function readThreeLines() {
    let lines = await readFile('txt/threeLines.txt');

    checkResults(lines, ["foo", "bar", "baz", ""]);
}

async function readThreeNoEol() {
    let lines = await readFile('txt/threeLines_no_eol.txt');

    checkResults(lines, ["foo", "bar", "baz // no eol"]);
}

async function readLinesAndBlanks() {
    let lines = await readFile('txt/lines_and_blanks.txt');

    checkResults(lines, ["foo", "bar", "baz", "", "qaz", "", "fin", ""]);
}

async function readEmpty() {
    let lines = await readFile('txt/empty.txt');

    checkResults(lines, []);
}

async function readOneChar() {
    let lines = await readFile('txt/oneChar.txt');

    checkResults(lines, ["a"]);
}

async function readOneCharAndNewline() {
    let lines = await readFile('txt/oneChar_and_newline.txt');

    checkResults(lines, ["a", ""]);
}

async function readNewline() {
    let lines = await readFile('txt/newline.txt');

    checkResults(lines, ["", ""]);
}

readThreeLines()
.then(readThreeNoEol)
.then(readLinesAndBlanks)
.then(readEmpty)
.then(readOneChar)
.then(readOneCharAndNewline)
.then(readNewline);