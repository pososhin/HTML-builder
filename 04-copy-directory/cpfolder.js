var fs = require('fs');

module.exports.cp = function (DIR_SOURCE, DIR_TARGET) {
    new Promise((res, rej) => {
        fs.rm(DIR_TARGET, { recursive: true }, (e, r) => {
            // if (e) rej(e);
            fs.mkdir(DIR_TARGET, () => {
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
            copyFiles(DIR_SOURCE, DIR_TARGET);
            res();
        })
    }).catch((e) => console.log(e));
}