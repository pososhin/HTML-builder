const fs = require('fs');
const path = require('path');

check_version();

const DIR = './05-merge-styles/';
const DIR_STYLE = DIR + 'styles';
const FILE_BUNDEL = DIR + 'project-dist/bundle.css';

bundlecss(DIR_STYLE,FILE_BUNDEL);

function check_version(q) {
    let version = process.version.match(/v(\d+)\.(\d+)\.(\d+)/);
    if (version[1] < 16 || version[2] < 13) {
        if (!q) {
            console.log("----------------------------------------------");
            console.log("Вы запускаете скрипт под Node " + process.version);
            console.log("Проверка должна проводится на Node 16.13.0 LTS");
            console.log("----------------------------------------------");
        }
        return false;
    }
    return true;
}

function bundlecss(dir_styles, file_bundle) {
    new Promise((res, rej) => {       
        let allFilesPr = [];
        fs.readdir(dir_styles, (err, files) => {
            if (err) rej(err);
            for (let file of files) {
                if (path.extname(file).toLowerCase() == '.css') {
                    allFilesPr.push(new Promise((res_file, rej_file) => {
                        fs.stat(dir_styles + '/' + file, (errStat, status) => {
                            if (errStat) {
                                rej_file(errStat);
                            } else {
                                if (status.isFile()) {
                                    let stream = new fs.ReadStream(dir_styles + '/' + file, { encoding: "utf-8" });
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
            const stream = fs.createWriteStream(file_bundle, 'utf8');
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
}

