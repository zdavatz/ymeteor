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
DB.itemInsert = (doc, field,type) => {
  var isItem = Items.findOne({
    [field]: doc[field],
    type: type
  })
  if (!isItem) {
    Items.insert(doc);
    log('success','DB: Doc Inserted : ' + doc[field] + ' - ' + doc['name'] + ' - Project:' +type)
  }else{
    // Update products
   log('warning','DB: Doc Exists' + doc[field])
   console.log('Update:', doc)
   Items.update({_id:isItem._id},{$set:doc})
   log('success','DB: Doc Update' + doc[field])
  }
}
/**
 * 
 */


/**
 * 
 */
DB.batchInsert = async (data, field,project) => {
  console.log(data[2],field,project)
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
      item.project = project
      Items.insert(item)
    } else {
      console.log('DB.batchInsert: Doc[Exists], Doc', item[field], 'Exists')
    }
  })
}
//
DB.batchDrugs = async (data,project) => {
  if (!data || !data.length) {
    console.log('DB:batchInsert Err')
    return;
  }
  console.log('Checking meds.....')
  _.each(data, (item) => {
    let isExist = Drugs.findOne({
      name: item
    })
    // console.log('debug')
    if (!isExist) {
      console.log('DrugsInsert: Success,', item, 'Inserted')
      if (!item) {
        console.log('DrugsInsert: Error', item, 'Does not exist')
        return
      }
      Drugs.insert({
        name: item,
        project: 'product'
      })
    }
  })
}
// Drugs.remove({})

/**
 * Batch Insert
 * Data: JSONArr, Field: Uniqe field, Project: Str (Identifier for Export)
 */
DB.batchAtc = async (data,field,project) => {
  if (!data || !data.length) {
    console.log('DB:batchInsert Err')
    return;
  }
  console.log('Checking meds.....')
  
  _.each(data, (item) => {
    let isExist = Drugs.findOne({
      name: item.name
    })
    /**
     * 
     */
    if (!isExist) {
      if (!item || !item.name) {
        console.log('Checking...')
        return
      }
      item.project = project
      log(item)
      log('CHECKING DRUGS',item)
      console.log('DrugsInsert: Success,', item, 'Inserted')
      Drugs.insert(item)
    }else{
      console.log('Exist',item)
    }
    /**
     * 
     */
    // if(isExist && !item.meta){
    //   console.log('Meta: Does not exist')
    //  // Drugs.update({_id:item._id},{$set:{}})
    // }else{
    //   console.log('Meta: Exists')
    // }


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
