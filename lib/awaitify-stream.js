// Copyright (C) 2017 Chris Sidi
//
// packaging and argument validation based on node-byline, Copyright (C) 2011-2015 John Hewson

'use strict';
const aw = exports;

aw.createReader = function(readStream) {
    let obj = {
        stream: readStream,
        readable: true
    };

    return addReaderFunctions(readStream, obj);
}

aw.createWriter = function(writeStream) {
    let obj = {
        stream: writeStream,
        writable: true
    };

    return addWriterFunctions(writeStream, obj);
}

aw.createDuplexer = function(duplexStream) {
    let obj = {
        stream: duplexStream,
        readable: true,
        writable: true
    };

    return addDuplexFunctions(duplexStream, obj);
}

aw.addAsyncFunctions = function(stream, obj) {
    if (!stream) {
        throw new Error('stream argument required.');
    }

    if (!stream.readable && !stream.writable) {
        throw new Error('stream must be readable and/or writable.');
    }

    if (!obj) {
        obj = stream;
    }

    if (stream.readable) {
        addReaderFunctions(stream, obj);
    }

    if (stream.writable) {
        addWriterFunctions(stream, obj);
    }

    return obj;
}

function addDuplexFunctions(stream, obj) {
    addReaderFunctions(stream, obj);
    addWriterFunctions(stream, obj);

    return obj;
}

function addReaderFunctions(readStream, obj) {
    if (!readStream) {
        throw new Error('readStream argument required.');
    }
    if (!readStream.readable) {
        throw new Error('readStream is not readable.');
    }
    if (!obj) {
        throw new Error('obj argument required.');
    }

    const errors = [];
    readStream.on('error', (err) => {
        errors.push(err);
    });

    let ended = false;
    readStream.on('end', () => {
        ended = true;
    });

    obj.readAsync = function(size) {
        return new Promise((resolve, reject) => {
            function read() {
                // unregister the listener that wasn't called to avoid leaks.
                readStream.removeListener('readable', read);
                readStream.removeListener('end', read);
                readStream.removeListener('error', read);

                if (errors.length) {
                    reject(errors.shift());
                    return;
                }

                if (ended) {
                    resolve(null);
                    return;
                }

                let data = readStream.read(size);
                if (errors.length) {
                    reject(errors.shift());
                    return;
                }
                if (data !== null) {
                    resolve(data);
                    return;
                }

                // wait for more data to be available, or the end of the stream.
                readStream.once('readable', read);
                readStream.once('end', read);
                // Note that in the event of an error, the error-setting listener will be called ahead of read.
                // "The EventEmitter calls all listeners synchronously in the order in which they were registered." - https://nodejs.org/dist/latest-v8.x/docs/api/events.html
                readStream.once('error', read);
            }

            // Attempt to read data.
            read();
        });
    };

    return obj;
}

function addWriterFunctions(writeStream, obj) {
    if (!writeStream) {
        throw new Error('writeStream argument required.');
    }
    if (!writeStream.writable) {
        throw new Error('writeStream is not writable.');
    }
    if (!obj) {
        throw new Error('obj argument required.');
    }

    let bufferAvailable = true;
    writeStream.on('drain', () => {
        bufferAvailable = true;
    });

    const errors = [];
    writeStream.on('error', (err) => {
        errors.push(err);
    });

    obj.writeAsync = function(chunk, encoding) {
        return new Promise((resolve, reject) => {
            function write() {
                // unregister the listener that wasn't called to avoid leaks.
                writeStream.removeListener('drain', write);
                writeStream.removeListener('error', write);

                if (errors.length) {
                    reject(errors.shift());
                    return;
                }

                if (bufferAvailable) {
                    bufferAvailable = writeStream.write(chunk, encoding);
                    if (errors.length) {
                        reject(errors.shift());
                    } else {
                        resolve();
                    }
                    return;
                }

                writeStream.once('drain', write);
                writeStream.once('error', write);
            }

            write();
        });
    };

    obj.endAsync = function(chunk, encoding) {
        return new Promise((resolve, reject) => {
            if (errors.length) {
                reject(errors.shift());
                return;
            }

            function ended()
            {
                // unregister the listener that wasn't called to avoid leaks.
                writeStream.removeListener('error', ended);

                if (errors.length) {
                    reject(errors.shift());
                    return;
                }

                resolve();
            }

            writeStream.on('error', ended);
            writeStream.end(chunk, encoding, ended);
        });
    };

    return obj;
}
