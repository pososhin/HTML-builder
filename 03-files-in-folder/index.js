var fs = require('fs');
var path = require('path');

let version =  process.version.match(/v(\d+)\.(\d+)\.(\d+)/);
if(version[1]<16 || version[2]<13){
    console.log("Вы запускаете скрип под Node "+process.version);
    console.log("Проверка проводится на Node 16.13.0 LTS");
    process.exit();
}

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
                        showFiles(dir + '/' + file);
                    }
            });
        }
    });
}
showFiles(DIR)