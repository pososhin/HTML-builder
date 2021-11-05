var fs = require('fs');
var path = require('path');
const check_version = require('../01-read-file/checkversion');

check_version.valid();

const DIR = './05-merge-styles/';
const DIR_STYLE = DIR + 'styles';
const FILE_BUNDEL = DIR + 'project-dist/bundle.css';


new Promise((res, rej) => {
    let cssfiles = [];
    let allFilesPr = [];
    fs.readdir(DIR_STYLE, (err, files) => {
        if (err) rej(err);
        for (let file of files) {
            cssfiles.push(DIR_STYLE + '/' + file);
            if (path.extname(file).toLowerCase() == '.css') {
                allFilesPr.push(new Promise((res_file, rej_file) => {
                    fs.stat(DIR_STYLE + '/' + file, (errStat, status) => {
                        if (errStat) {
                            rej_file(errStat);
                        } else {
                            if (status.isFile()) {
                                let stream = new fs.ReadStream(DIR_STYLE + '/' + file, { encoding: "utf-8" });
                                stream.on('readable', () => res_file(stream.read()));
                                stream.on('end', () => stream.destroy());
                            } else {
                                res_file('');
                            }
                        }
                    });

                }));
            }
        }
        res(Promise.all(allFilesPr));
    });
}).then((data) => {
    return new Promise((res, rej) => {
        const stream = fs.createWriteStream(FILE_BUNDEL, 'utf8');
        stream.on('error', (err) => rej(err));
        stream.once('open', function (fd) {
            stream.write(data.join("\n"));
            stream.end();
            stream.destroy();
            res();
        });
    })
})
    .catch((e) => console.log("Error:", e));



