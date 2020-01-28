const fs = require("fs");
/*
*/
const rootDir = process.env['METEOR_SHELL_DIR'] + '/../../../';
const public = rootDir+ 'public/';
const exportDir = public + 'exports'
const schemaDir = public +'schema'
Util = {}
Util.rootDir = rootDir;
Util.public = public;
Util.exportDir = exportDir;
Util.schemaDir = schemaDir;
/**
 * 
 */
createDir(schemaDir)
createDir(exportDir)
/**
 * 
 */
Util.isFileExists = (filePath)=>{
    let isFileExists = fs.existsSync( + filePath);
    if(isFileExists){
        return true
    }
}
/**
 * 
 * 
 */
function createDir(folderName){
    try {
        if (!fs.existsSync(folderName)) {
          console.log('Creating directory', folderName)
          fs.mkdirSync(folderName)
        }
        console.log('Checking directory', folderName)
      } catch (err) {
        console.error(err)
      }
}
