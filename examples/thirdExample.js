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
