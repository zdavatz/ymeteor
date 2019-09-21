/*
    DB.
*/

import _ from 'lodash'
import './collections.js'
import log from './log.js'
import {
  globalAgent
} from 'http';

DB = {}
/*
  DB insert Collection
*/
DB.itemInsert = async (doc, field) => {
  if (!Items.findOne({
      [field]: doc[field]
    })) {
    Items.insert(doc);
    log('success','DB: Doc Inserted' + doc[field] + ' -  ' + doc['name'])
  }else{
   log('warning','DB: Doc Exists' + doc[field])
  }
}


DB.batchInsert = async (data, field) => {
  if (!data || !data.length || !field) {
    console.log('DB:batchInsert Err')
    return;
  }
  _.each(data, (item) => {
    let isExist = Items.findOne({
      [field]: item[field]
    })
    if (!isExist) {
      console.log('DB.batchInsert: Success,', item[field], 'Inserted')
      Items.insert(item)
    } else {
      console.log('DB.batchInsert: Doc[Exists], Doc', item[field], 'Exists')
    }
  })
}

//

DB.batchDrugs = async (data) => {
  if (!data || !data.length) {
    console.log('DB:batchInsert Err')
    return;
  }

  console.log('Checking meds.....')
  _.each(data, (item) => {
    let isExist = Drugs.findOne({
      name: item
    })
    if (!isExist) {
      console.log('DrugsInsert: Success,', item, 'Inserted')
      if (!item) {
        return
      }
      Drugs.insert({
        name: item
      })
    }
  })


}

//

DB.batchColInsert = (col, data, field) => {
  if (!data || !data.length || !field || !global[col]) {
    console.log('DB:batchInsert Err', col)
    return;
  }
  _.each(data, (item) => {
    let isExist = global[col].findOne({
      [field]: item[field]
    })
    if (!isExist) {
      console.log('DB.batchColInsert: Success,', item[field], 'Inserted')
      global[col].insert(item)
    } else {
      console.log('DB.batchColInsert: Success[Exists], Doc', item[field], 'Exists')
    }
  })
}

/*
  Checking f a keyword is scrapped or not
*/
DB.checkKeywod = (isTesting) => {
  if (isTesting) return;


}
