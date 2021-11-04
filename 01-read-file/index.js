var fs = require('fs');

let version =  process.version.match(/v(\d+)\.(\d+)\.(\d+)/);
if(version[1]<16 || version[2]<13){
    console.log("Вы запускаете скрип под Node "+process.version);
    console.log("Проверка проводится на Node 16.13.0 LTS");
    process.exit();
}

var stream = new fs.ReadStream("./01-read-file/text.txt",{encoding:"utf-8"});
stream.on('readable', function(){
    var data = stream.read();
    if(data!==null) console.log(data);
});
stream.on('end', function(){ stream.destroy(); });