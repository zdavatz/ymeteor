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
  log('warning','$meteor  --setting atc.json')
}
Check = {}
Check.pharma = Items.find({type:'pharma'}).count()
Check.swiss = Items.find({type:'doc'}).count()
Check.code = Items.find({type:'pharma'}).count()
// Check.pharmaX = Items.find({type:'pharma'},{limit:1}).fetch()
// Check.atc = Items.find({project:'atc'},{limit:1}).fetch()
// Check.drugsAtc = Drugs.findOne({project:'atc'})
// Check.drugsProduct = Drugs.findOne({})
// log('start',JSON.stringify(Check))
console.log(Check)


Meteor.methods({
  stats(){
    var stats = {};
    stats.SwissMedicDrugsDe = Items.find({type:'drug',lang:'de'}).count()
    stats.SwissMedicDrugsFr = Items.find({type:'drug',lang:'fr'}).count()
    stats.SwissMedicDhcpDe = Items.find({type:'doc',lang:'de'}).count()
    stats.SwissMedicDhcpFR = Items.find({type:'doc',lang:'fr'}).count()
    return stats;
  },
  search(keyword){
    // console.log('results',Items.find({$or:[{name:{$regex:keyword}},{code:keyword}]}).count())
    console.log('re',Items.find({name:{$regex:keyword}}).fetch())
    return Items.find({$or:[{name:{$regex:keyword}},{code:keyword}]}).fetch()
  }
})


Meteor.publish('searchResults',function(keyword){
  console.log(keyword)
  if(!keyword) return;
  return Items.find({$or:[{name:{$regex:keyword}},{keyword:keyword}]},{limit:10})
})