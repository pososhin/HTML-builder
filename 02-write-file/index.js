const fs = require('fs');

const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
const rl = readline.createInterface({ input, output });

const DIR = './02-write-file/';
const FILENAME = 'text.txt';

new Promise((res) => {
    const newFilename = (count = 0) => {
        let fname = FILENAME;
        if (count) {
            let a = fname.split('.');
            if (a.length > 1) {
                let ext = a.pop();
                fname = a.join('.') + '_' + count + '.' + ext;
            } else { FILENAME + '_' + count }
        }
        fs.stat(DIR + fname, (err, stat) => {
            if (err == null) {
                newFilename(count + 1);
            } else if (err.code === 'ENOENT') {
                res(DIR + fname);
            } else {
                console.log('Error: ', err.code);
            }
        });
    };
    newFilename();
}).then(
    (fname) => {
        return new Promise(res => {
            const stream = fs.createWriteStream(fname, 'utf8');
            stream.on('error', (err) => console.log(`Err: ${err}`));
            // stream.on('finish', () => console.log('Done'));
            stream.once('open', function (fd) {
                console.log("\nHello\n");
                console.log('A new text file [' + fname + '] was created to record your input to the console');
                console.log("To complete, enter the word 'exit' or ctrl-C");
                res(stream);
            });
        })
    }
).then(
    streamWrite => {
        let first_line = true;
        return new Promise(res => {
            const fn_exit = (ctrl) => {
                let ctrlC = ctrl || false;
                rl.close();
                streamWrite.end();
                res(ctrlC);
            }
            const fn_input = () => {
                rl.question((first_line) ? "insert something here\n>" : '>', (answer) => {
                    first_line = false;
                    if (answer == 'exit') {
                        fn_exit();
                    } else {
                        streamWrite.write(answer + "\n");
                        fn_input();
                    };
                });
                process.stdin.on('keypress', (c, k) => {
                    if (k.sequence == '\u0003') {
                        fn_exit(true);
                    }
                });
            }
            fn_input();
        });
    }
)
    .catch((e) => console.log('error:', e))
    .then((c) => {
        if (c) console.log("\nCTRL-C exit without saving the last line");
        console.log('Goodbye')
    })

