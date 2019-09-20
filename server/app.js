const fs = require('fs')
App = {}
App.path = process.env['METEOR_SHELL_DIR'] + '/../../../public/';
App.writeFile = async(file, data) => {
    await fs.writeFile(App.path + file, data, (err) => {
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