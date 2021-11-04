var fs = require('fs');
var stream = new fs.ReadStream("./01-read-file/text.txt",{encoding:"utf-8"});
stream.on('readable', function(){
    var data = stream.read();
    if(data!==null) console.log(data);
});
stream.on('end', function(){ stream.destroy(); });