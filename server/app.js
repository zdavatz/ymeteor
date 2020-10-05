const fs = require('fs')
import Log from './log';
App = {}
App.path = process.env['METEOR_SHELL_DIR'] + '/../../../public/';
log = console.log;


/**
 * Generate files if does not exist
 */
/*

*/
App.writeFile = async(file, data) => {
    log('Writing file =>', file)
    await fs.writeFileSync(App.path + file, data, 'utf8', (err) => {
      if (err) log('error',err);
      log('progress',"File updated" + file);
    });
}
/* 
  Write file to Disk
  => ('/export/FILENAME',data)
*/
  /*
    getItems
      - Fetch collection with certain values
  */
 App.getItems = async(type, lang) => {
    return Items.find({
      lang: lang,
      type: type
    }).fetch()
  }


  App.exit = async()=>{
    process.exit(1)
    process.kill(process.pid)
  }