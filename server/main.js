import {
  Meteor
} from 'meteor/meteor';

var prettyjson = require('prettyjson');


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
  if(!keyword){
    return
  }
  console.log('Searching for:', keyword)
  console.log('Searching for: name, keyword, amKlassification,number', keyword)
  // const partialMatch = new RegExp(`^${searchText}`, 'i');
  // if(!keyword) return;

  return Items.find({$or:[{name:{$regex:keyword , $options: "ig" }},{number: {$regex:keyword , $options: "ig"}},{keyword: {$regex:keyword , $options: "ig"}},{amKlassification: {$regex:keyword , $options: "ig"}} ]})
})
/**
 *  Pretty JSON options
 */

var options = {
  keysColor: 'brightCyan',
  dashColor: 'magenta',
  stringColor: 'whbrightWhiteite'
};

/**
 * 
 */
Stats = {}

Stats.Total = Items.find({}).count()
Stats.ATC =  Items.find({type:'acc'}).count()
Stats.ATCwithMeta = Items.find({meta: {$exists:true}}).count()
Stats.ATCwithOutMeta = Items.find({meta: {$exists:false}}).count()
Stats.Pharma = Items.find({type:'pharma'}).count()


Stats.SwissMedicDrugsDe = Items.find({type:'drug',lang:'de'}).count()
Stats.SwissMedicDrugsFr = Items.find({type:'drug',lang:'fr'}).count()
Stats.SwissMedicDhcpDe = Items.find({type:'doc',lang:'de'}).count()
Stats.SwissMedicDhcpFR = Items.find({type:'doc',lang:'fr'}).count()


/** */
console.log(prettyjson.render(Stats, options))


/**\
 * Update Items Meta.
 */

dataCheck()

async function dataCheck (){
  // 
  var items = Items.find({project: 'acc', meta: {$exists:false}}).fetch()
  console.log("Items to be updated: ", items.length)
  if(items.length){
    _.each(items,(item)=>{
      var meta = Drugs.findOne({code:item.keyword})
      console.log('Item meta is update[START]',item.keyword, "-->",  meta)
      if(meta){
        Items.update({_id: item._id},{$set: { meta: meta}})
        console.log('Item meta is updated',item.keyword, "-->", meta)
      }

    })
  }

}


