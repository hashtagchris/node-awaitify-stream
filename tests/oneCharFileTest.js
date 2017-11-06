const fs = require('fs');
const aw = require('../lib/awaitify-stream.js');

async function readFile() {
    const testFile = 'txt/oneChar.txt';

    console.log(`*** Opening ${testFile} for reading.`);

    let readStream = fs.createReadStream(testFile);

    let reader = aw.createReader(readStream);

    let chunk;
    let chunkCount = 0;
    while (null !== (chunk = await reader.readAsync())) {
        chunkCount++;
    }

    console.log(`Chunk count: ${chunkCount}`);

    if (chunkCount !== 1) {
        throw new Error('One character file should have one chunk.');
    }

    console.log('*** Done reading.');
}

readFile();