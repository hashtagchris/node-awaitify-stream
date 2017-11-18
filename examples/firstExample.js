const fs = require('fs');
const aw = require('awaitify-stream');

async function run() {
    let readStream = fs.createReadStream('firstExample.js');
    let reader = aw.createReader(readStream);
    let writer = aw.createWriter(process.stdout);

    // Read the file and write it to stdout.
    let chunk, count = 0;
    while (null !== (chunk = await reader.readAsync())) {
        // Perform any synchronous or asynchronous operation here.
        await writer.writeAsync(chunk);
        count++;
    }

    console.log(`\n\nDone. Read the file in ${count} chunk(s).`);
}

run();