const fs = require('fs');
const aw = require('../lib/awaitify-stream.js');

async function readFile() {
    const testFile = 'txt/empty.txt';

    console.log(`*** Opening ${testFile} for reading.`);

    let readStream = fs.createReadStream(testFile);

    let reader = aw.createReader(readStream);

    let chunk;
    let chunkCount = 0;
    while (null !== (chunk = await reader.readAsync())) {
        chunkCount++;
    }

    console.log(`Chunk count: ${chunkCount}`);

    if (chunkCount !== 0) {
        throw new Error('Empty file should have zero chunks.');
    }

    console.log('*** Done reading.');
}

readFile();