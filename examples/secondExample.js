const fs = require('fs');
const aw = require('awaitify-stream');
const lineLength = 6; // 5 digits in a zip code, plus the newline character.

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function run() {
    let stream = aw.addAsyncFunctions(fs.createReadStream('zipCodes.lftxt'));
    stream.setEncoding('utf8');

    // Read and print zip codes, slowly.
    let zipCode;
    while (null !== (zipCode = await stream.readAsync(lineLength))) {
        // Remove the newline character. If you didn't set the encoding
        // above, use zipCode.toString().trim()
        zipCode = zipCode.trim();

        console.log(zipCode);
        await delay(200);
    }
}

run();