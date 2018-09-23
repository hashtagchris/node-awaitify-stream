# node-awaitify-stream
Read or write to a stream using `while` and `await`, not event handlers.

- Read and write streams using familiar constructs, without resorting to synchronous methods for I/O.
- Read and write long streams without runaway memory usage.
- Process streams one chunk or line at a time. Await asynchronous operations inbetween.

## Requirements

- Node v8+ recommended. `async`/`await` support was added to Node v7. Node v6 will throw "SyntaxError: Unexpected token function" for the examples below. See [secondExample_without_await.js](examples/secondExample_without_await.js) for an example of using awaitify-stream without `await`.

## Install

    npm install awaitify-stream

# Reader functions

- `readAsync([size])`: Promise wrapper around [readable.read](https://nodejs.org/dist/latest-v8.x/docs/api/stream.html#stream_readable_read_size). Returns a promise for the next chunk of data. Resolves to null at the end of the stream.

# Writer functions

- `writeAsync(chunk[, encoding])`: Promise wrapper around [writable.write](https://nodejs.org/dist/latest-v8.x/docs/api/stream.html#stream_writable_write_chunk_encoding_callback). Returns a promise that resolves following a `drain` event (if necessary) and a call to `write`. Doesn't wait for the chunk to be flushed.

- `endAsync([chunk][, encoding])`: Promise wrapper around [writable.end](https://nodejs.org/dist/latest-v8.x/docs/api/stream.html#stream_writable_end_chunk_encoding_callback). Returns a promise that resolves when the stream is finished.

# Reader/Writer API

Use `createReader`, `createWriter` or `createDuplexer` to create a wrapper around the stream. The `stream` property can be used to later access the stream.

```javascript
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
```

# Augment Stream API

Use `addAsyncFunctions` to add the reader and/or writer functions to a stream object. The reader functions are added if `stream.readable` is true. The writer functions are added if `stream.writable` is true.

```javascript
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
```

# Line Reading

You can use `awaitify-stream` in combination with a package like `byline` to read a line at a time.

```javascript
const fs = require('fs');
const aw = require('awaitify-stream');
const byline = require('byline');
const readline = require('readline'); // Used for prompting the user.

function checkGuess(rl, guess) {
    return new Promise((resolve) => {
        rl.question(`Is the ${guess} your card? [y/n] `, (answer) => {
            resolve(answer.startsWith('y'));
        });
    });
}

async function run() {
    let stream = fs.createReadStream('millionsOfGuesses.txt');
    stream.setEncoding('utf8');

    let lineStream = byline.createStream(stream, { keepEmptyLines: false });
    let reader = aw.createReader(lineStream);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        let line;
        while (null !== (line = await reader.readAsync())) {
            let guessedCard = await checkGuess(rl, line);

            if (guessedCard) {
                console.log('Huzzah!');
                return;
            }
        }

        console.log('Drat!');
    }
    finally {
        rl.close();
    }
}

run();
```

# Related Packages

- [byline](https://github.com/jahewson/node-byline): Useful for reading streams line-by-line. I recommend using `byline` over node's builtin [readline](https://nodejs.org/dist/latest-v8.x/docs/api/readline.html#readline_example_read_file_stream_line_by_line) because you can pause the stream or await asynchronous operations inbetween each line.

- [stream-consume-promise](https://www.npmjs.com/package/stream-consume-promise): Similar to this package, but returns an iterator-style response with `value` and `done` properties. Also see [stream-produce-promise](https://github.com/Qard/stream-produce-promise).

# Notes

- The library has no dependencies. `mocha` and `byline` are required only for testing.

# Credits

[byline](https://github.com/jahewson/node-byline) served as an example package as I was writing `awaitify-stream`, my first package.

[davedoesdev](https://github.com/davedoesdev) contributed fixes.

[mknj](https://github.com/mknj) identified an issue with error handling.