import {
  Meteor
} from 'meteor/meteor';
import log from './log.js'
import './swissmedic-o.js'
import './pharma.js'
import './app.js'



if (process.pid) {
  console.log('This process is your pid ' + process.pid);
}

if(!Meteor.settings.isPharma && !Meteor.settings.isSwiss){
  log('error','Please specificy setting file:')
  log('warning','$meteor  --setting pharma.json')
  log('warning','$meteor  --setting swiss.json')
}

Check = {}
Check.pharma = Items.find({type:'pharma'}).count()
Check.swiss = Items.find({type:'doc'}).count()

log('start',JSON.stringify(Check))

App.writeFile('/exports/pharma.json', JSON.stringify(Items.find({
  type: 'pharma'
}).fetch()))