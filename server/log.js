//const chalk = require('chalk');
const types = ['error', 'screen', 'warning', 'success', 'progress', 'info', 'def', 'start', 'done', 'srep']
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
var specialTypes = ['start', 'done']
Log = async function (type, msg) {
  log = console.log
  if (specialTypes.includes(type)) {
    console.log(chalkColors[type](type.toUpperCase() + ':'), chalkColors[type](msg))
  } else {
    console.warning(msg)
  }
}
module.exports = Log