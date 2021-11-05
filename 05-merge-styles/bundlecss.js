var fs = require('fs');
var path = require('path');

module.exports.bundle = function (dir_styles, file_bundle) {
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


