const fs = require('fs');
const aw = require('awaitify-stream');
const lineLength = 6; // 5 digits in a zip code, plus the newline character.

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function run() {
    let stream = aw.addAsyncFunctions(fs.createReadStream('zipCodes.lftxt'));
    stream.setEncoding('utf8');

    return new Promise((resolve, reject) => {
        function readNextLine() {
            stream.readAsync(lineLength).then((zipCode) => {
                if (zipCode !== null) {
                    // Remove the newline character. If you didn't set the encoding
                    // above, use zipCode.toString().trim()
                    zipCode = zipCode.trim();
                    console.log(zipCode);

                    delay(200)
                    .then(readNextLine);
                }
                else {
                    // We've hit the end of the file. We're done.
                    resolve();
                }
            })
            .catch(reject);
        }

        readNextLine();
    });
}

run()
.then(() => {
    console.log('All done!');
});