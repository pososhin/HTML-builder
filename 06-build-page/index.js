const fs = require('fs');
const path = require('path');
const check_version = require('../01-read-file/checkversion');
const bundlecss = require('../05-merge-styles/bundlecss').bundle;
const copy_folder = require('../04-copy-directory/cpfolder').cp;

check_version.valid();

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
