const  fs = require('fs');

check_version();

const DIR = './04-copy-directory/'
const DIR_SOURCE = 'files'
const DIR_TARGET = 'files-copy'

copy_folder(DIR+DIR_SOURCE,DIR+DIR_TARGET);

function copy_folder(dir_source, dir_target) {
    new Promise((res, rej) => {
        fs.rm(dir_target, { recursive: true }, (e, r) => {
            // if (e) rej(e);
            fs.mkdir(dir_target, () => {
                res();
            });
        });
    }).then((a) => {
        return new Promise((res, rej) => {
            function copyFiles(source, target) {
                fs.readdir(source, (err, files) => {
                    if (err) rej(err);
                    for (let file of files) {
                        fs.stat(source + '/' + file, (errStat, status) => {
                            if (errStat) rej(errStat);
                            if (status.isFile()) {
                                fs.createReadStream(source + '/' + file)
                                    .pipe(fs.createWriteStream(target + '/' + file));
                            } else {
                                fs.mkdir(target + '/' + file, { recursive: true }, (e) => {
                                    if (e) rej(e);
                                    copyFiles(source + '/' + file, target + '/' + file);
                                });
                            }
                        });
                    }
                });
            }
            copyFiles(dir_source, dir_target);
            res();
        })
    }).catch((e) => console.log(e));
}

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
