var fs = require('fs');

const DIR = './04-copy-directory/'
const DIR_SOURCE = 'files'
const DIR_TARGET = 'files-copy'

let version =  process.version.match(/v(\d+)\.(\d+)\.(\d+)/);
if(version[1]<16 || version[2]<13){
    console.log("Вы запускаете скрип под Node "+process.version);
    console.log("Проверка проводится на Node 16.13.0 LTS");
    process.exit();
}

new Promise((res, rej) => {
    fs.rm(DIR + DIR_TARGET, { recursive: true }, (e, r) => {
        // if (e) rej(e);
        fs.mkdir(DIR + DIR_TARGET, () => {
            res();
        });
    });
}).then((a) => {
    return new Promise((res, rej) => {
        function copyFiles(dir, source, target) {
            fs.readdir(dir + source, (err, files) => {
                if (err) rej(err);
                for (let file of files) {
                    fs.stat(dir + source + '/' + file, (errStat, status) => {
                        if (errStat) rej(errStat);
                        if (status.isFile()) {
                            fs.createReadStream(dir + source + '/' + file)
                                .pipe(fs.createWriteStream(dir + target + '/' + file));
                        } else {
                            fs.mkdir(dir + target + '/' + file, { recursive: true }, (e) => {
                                if (e) rej(e);
                                copyFiles(dir, source + '/' + file, target + '/' + file);
                            });
                        }
                    });
                }
            });
        }
        copyFiles(DIR, DIR_SOURCE, DIR_TARGET);
        res();
    })
})
    .catch((e) => console.log(e));

