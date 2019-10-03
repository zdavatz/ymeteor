import {
  Meteor
} from 'meteor/meteor';
import log from './log.js'
import './swissmedic-o.js'
import './pharma.js'
import './atc.js'
import './app.js'
if (process.pid) {
  console.log('This process is your pid ' + process.pid);
}
if(!Meteor.settings.isPharma && !Meteor.settings.isSwiss && !Meteor.settings.isCode){
  log('error','Please specificy setting file:')
  log('warning','$meteor  --setting pharma.json')
  log('warning','$meteor  --setting swiss.json')
  log('warning','$meteor  --setting code.json')
}
Check = {}
Check.pharma = Items.find({type:'pharma'}).count()
Check.swiss = Items.find({type:'doc'}).count()
Check.code = Items.find({type:'code'}).count()
// Check.pharmaX = Items.find({type:'pharma'},{limit:1}).fetch()
// Check.atc = Items.find({project:'atc'},{limit:1}).fetch()
// Check.drugsAtc = Drugs.findOne({project:'atc'})
// Check.drugsProduct = Drugs.findOne({})
// log('start',JSON.stringify(Check))
console.log(Check)
