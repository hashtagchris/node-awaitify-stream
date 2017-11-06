const fs = require('fs');
const aw = require('../lib/awaitify-stream.js');

const testFile = 'smallFile.txt';
const expectedLines = ["foo\n", "bar\n", "baz\n"];
const lineLength = 4;

function checkResults(lines) {
    if (lines.length !== expectedLines.length) {
        throw new Error(`Expected ${expectedLines.length} lines. Actual: ${lines.length}`);
    }

    for (let i = 0; i < expectedLines.length; i++) {
        if (lines[i] !== expectedLines[i]) {
            throw new Error(`Line ${i + 1}: Expected '${expectedLines[i]}'. Actual: ${lines[i]}`);
        }
    }
}

async function writeFile() {
    console.log(`*** Opening ${testFile} for writing.`);

    let writeStream = fs.createWriteStream(testFile);

    aw.addAsyncFunctions(writeStream);

    for (let i = 0; i < expectedLines.length; i++) {
        await writeStream.writeAsync(expectedLines[i]);
    }

    // Indicate that we're done, and wait for all the data to be flushed and the 'finish' event.
    await writeStream.endAsync();

    // If we waited for everything to flush, then we won't lose any data by calling close.
    writeStream.close();

    console.log('*** Done writing.');
}

async function readFile() {
    console.log(`*** Opening ${testFile} for reading.`);

    let readStream = aw.addAsyncFunctions(fs.createReadStream(testFile));

    let line;
    let lines = [];
    while (null !== (line = await readStream.readAsync(lineLength))) {
        // convert from Buffer to string.
        line = line.toString();
        lines.push(line);
        //console.log(`Line: ${line}`);
    }

    checkResults(lines);

    console.log('*** Done reading.');
}

writeFile()
.then(readFile);