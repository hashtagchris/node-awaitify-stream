const fs = require('fs');
const aw = require('../lib/awaitify-stream.js');

const testFile = 'bigFile.txt';
const testLineCount = 1234567;
// produce constant length lines when we're not using byline.
const lineLength = 140;

function constructLine(i) {
    let line = `${i}  `;

    while (line.length < (lineLength-1)) {
        line = line.concat("=");
    }

    line = line.concat('\n');

    return line;
}

async function writeFile() {
    console.log(`*** Opening ${testFile} for writing.`);

    let writeStream = fs.createWriteStream(testFile);

    let writer = aw.createWriter(writeStream);

    // Write lines as fast as possible, while honoring stream.write's response to halt until there's a 'drain' event.
    for (let i = 0; i <= testLineCount; i++) {
        let line = constructLine(i);
        await writer.writeAsync(line);
    }

    // Indicate that we're done, and wait for all the data to be flushed and the 'finish' event.
    await writer.endAsync();

    // If we waited for everything to flush, then we won't lose any data by calling close.
    writer.stream.close();

    console.log('*** Done writing.');
}

async function readFile() {
    console.log(`*** Opening ${testFile} for reading.`);

    let readStream = fs.createReadStream(testFile);

    let reader = aw.createReader(readStream);

    let lastLine, line;
    while (null !== (line = await reader.readAsync(lineLength))) {
        // console.log(`Line: ${line}`);
        lastLine = line;
    }

    // convert the Buffer to a string.
    lastLine = lastLine.toString();

    let expectedLastline = constructLine(testLineCount);

    if (lastLine !== expectedLastline) {
        console.log(`Last line: ${lastLine}`);
        console.log(`Expected:  ${expectedLastline}`);

        throw new Error('Last line read doesn\'t match expected.');
    }

    console.log('*** Done reading.');
}

writeFile()
.then(readFile);