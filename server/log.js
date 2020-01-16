//const chalk = require('chalk');



Log = async function(type,msg){
    log = console.log
    // log(chalk.blue('Hello') + ' World' + chalk.red('!'));
    var chalkColors = {}
    chalkColors.error = chalk.bold.red;
    chalkColors.screen = chalk.bold.red;
    chalkColors.success = chalk.bold.green;
    chalkColors.warning = chalk.bold.yellow;
    chalkColors.info = chalk.bold.blue;
    chalkColors.progress = chalk.cyan;
    chalkColors.def = chalk.white;
    chalkColors.step = chalk.white.bgCyan;
    chalkColors.start = chalk.bold.black.bgRed
    chalkColors.done = chalk.white.bold.bgCyan
    var specialTypes = ['start','done']
    if(specialTypes.includes(type)){
      console.log(chalkColors[type](type.toUpperCase()+':'),chalkColors[type](msg))
    }else{
      console.log(chalkColors[type](type.toUpperCase()+':'),chalkColors.def(msg))
    }
    
  }


  module.exports = Log
  