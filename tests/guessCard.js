const fs = require('fs'),
      byline = require('byline'),
      aw = require('../lib/awaitify-stream.js'),
      readline = require('readline');

function checkGuess(rl, guess) {
    return new Promise((resolve) => {
        rl.question(`Is ${guess} your card? [y/n] `, (answer) => {
            resolve(answer.startsWith('y'));
        });
    });
}

async function run() {
    let stream = fs.createReadStream('txt/millionsOfGuesses.txt');
    stream.setEncoding('utf8');

    // read the file stream a line at a time.
    let lineStream = byline.createStream(stream, { keepEmptyLines: false });

    // awaitable interface for reading the stream.
    let reader = aw.createReader(lineStream);

    // readline for prompting the user.
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
//.then(run); // confirm it's rerunnable, that stdin isn't toast.