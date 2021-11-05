const  fs = require('fs');
const  path = require('path');
const  check_version = require('../01-read-file/checkversion');

check_version.valid();

const DIR = './03-files-in-folder/secret-folder'

function showFiles(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) throw err;
        for (let file of files) {
            fs.stat(dir + '/' + file, (errStat, status) => {
                if (errStat) throw errStat;
                    let size = status.blksize*status.size;
                    if(status.isFile()){
                        let ext = path.extname(file);
                        let fname = path.basename(file,ext);
                        console.log(`${fname}-${ext.substr(1)}-${status.size}`);
                    } else{
                        // showFiles(dir + '/' + file);
                    }
            });
        }
    });
}
showFiles(DIR)