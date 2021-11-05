module.exports.valid = function (q) {
    let version = process.version.match(/v(\d+)\.(\d+)\.(\d+)/);
    if (version[1] < 16 || version[2] < 13) {
        if(!q){
            console.log("----------------------------------------------");
            console.log("Вы запускаете скрипт под Node " + process.version);
            console.log("Проверка должна проводится на Node 16.13.0 LTS");
            console.log("----------------------------------------------");
        }        
        return false;
    }    
    return true;
}