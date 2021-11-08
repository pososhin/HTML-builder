const fs = require('fs');
const path = require('path');

check_version();

const DIR = './06-build-page/';
const DIR_DIST = DIR + 'project-dist/';
const DIR_CSS = DIR + 'styles/';
const DIR_ASSETS_SOURCE = DIR + 'assets/';
const DIR_ASSETS_TARGET = DIR_DIST + 'assets/';
const DIR_PARTS = DIR + 'components/';
const FILE_TEMPLATE = DIR + 'template.html';
const FILE_HTML = DIR_DIST + 'index.html';
const FILE_CSS = DIR_DIST + 'style.css';

const regexTemplate = /\{\{(.*)\}\}/g;
new Promise((res, rej) => { res();
}).then(() => {
    return new Promise((res, rej) => {
        fs.rm(DIR_DIST, { recursive: true }, (e, r) => {
            fs.mkdir(DIR_DIST, () => {
                copy_folder(DIR_ASSETS_SOURCE,DIR_ASSETS_TARGET);
                bundlecss(DIR_CSS,FILE_CSS);                
                res();
            });
        });
    })
}).then(() => {
    return new Promise((res, rej) => {
        let template = [
            new Promise((res_template, rej_template) => {
                let stream = new fs.ReadStream(FILE_TEMPLATE, { encoding: "utf-8" });
                stream.on('readable', function () {
                    let data = stream.read();
                    if (data !== null) res_template(data);
                    rej_template('error read:' + FILE_TEMPLATE);
                });
                stream.on('end', function () { stream.destroy(); });
            })]
            ;
        fs.readdir(DIR_PARTS, (err, files) => {
            if (err) rej(err);
            for (let file of files) {
                let ext = path.extname(file);
                let basename = path.basename(file, ext);
                if (ext == '.html') {
                    template.push(
                        new Promise((res_part, rej_part) => {
                            let stream = new fs.ReadStream(DIR_PARTS + file, { encoding: "utf-8" });
                            stream.on('readable', function () {
                                let data = stream.read();
                                if (data !== null) {
                                    const part = {};
                                    part[basename] = data
                                    res_part(part);
                                } else {
                                    rej_part('error read:' + FILE_TEMPLATE);
                                }
                            });
                            stream.on('end', function () { stream.destroy(); });
                        })
                    )
                }
            }
            res(Promise.all(template));
        })
    })
}).then(template => {    
    let tmplt = template[0].split(regexTemplate);
    const m = template[0].match(regexTemplate).map(x => x.substr(2, x.length - 4));
    for (let fname of m) {
        for (let i = 0; i < tmplt.length; i++) {
            if (fname == tmplt[i]) {
                for (let p of template) {
                    if (p && p[fname]) {
                        tmplt[i] = p[fname];
                    }
                }
            }
        }
    }
    return (tmplt.join(''));
}).then(template => {
    return new Promise((res, rej) => {
        const stream = fs.createWriteStream(FILE_HTML, 'utf8');
        stream.on('error', (err) => console.log(`Err: ${err}`));
        stream.once('open', function (fd) {
            stream.write(template);
            stream.end();
            stream.destroy();
            res();
        });
    });
}).catch((e)=>console.log(e));

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
