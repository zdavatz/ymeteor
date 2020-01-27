const fs = require("fs");

/*

*/
const rootDir = process.env['METEOR_SHELL_DIR'] + '/../../../';
const public = rootDir+ 'public/';
const exportDir = public + 'exports'

Util = {}
Util.rootDir = rootDir;
Util.public = public;
Util.exportDir = exportDir;

if (!fs.existsSync(exportDir)){
    fs.mkdirSync(exportDir);
}


Util.isFileExists = (filePath)=>{
    let isFileExists = fs.existsSync( + filePath);
    if(isFileExists){
        return true
    }
}

