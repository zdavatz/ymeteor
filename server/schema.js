/**
 * Schema Generator
 */
const fs = require("fs");
path = require('path');
const _ = require("lodash")
const toJsonSchema = require('to-json-schema');
import './app.js'
import './util.js'
if (Meteor.settings.generateSchema) {
    generateSchema()
}
/**
 * Create the Diretcory if does not exist
 */
 /**
  * Generate Schemas
  * {strings: {detectFormat: false}}
  */
  /**
   * 
   */
function generateSchema() {
    let dirCont = fs.readdirSync(Util.exportDir);
    let files = dirCont.filter(function (elm) {
        return elm.match(/.*\.(json)/ig);
    });
    console.log('Getting files ready: ', files)
    for (i = 0; i < files.length; i++) {
        var options = {
            strings: {
              preProcessFnc: (value, defaultFnc) => {
                var schema = defaultFnc(value);
                // console.log('Schema Validation',value)
                if (value === 'datumLetzteMutation') {
                    // console.log('GTIN','ms')
                  schema.format = 'date';
                }
                return schema;
              },
            },
          }
        console.log('-------------------'+files[i]+'--------------------')
        console.log('Start: ',files[i])
        var file = files[i]
        var filePath = path.join(Util.exportDir, file);
        var data = fs.readFileSync(filePath,'utf8')
        var obj = JSON.parse(data)
        var schema = toJsonSchema(obj[0])
        console.log('Schema: ', file, "=>", schema)
        var fileName = file.split('.')[0] + "_schema" + '.json'
        var schemaDrugShortage = drugShortageFix(schema)
        writeSchema(fileName, schema)
        console.log('SUCCESS: ' + file);
        console.log('=========================================')
    }
    console.log('SUCCESS: ==> All schema is generated');
    console.log('Closing Meteor.')
    console.log('=========================================')
    process.exit(0)
}
/**
 * 
 * @param {*} fileName/ DATA 
 */
function writeSchema(fileName, data) {
    App.writeFile('/schema/' + fileName, JSON.stringify(data))
}
/**
 * Schema Fix
 */
function drugShortageFix(schema){
    // Date fields
    var dateFields = ['datumLetzteMutation','tageSeitErsterMeldung','datumLieferfahigkeit','date', 'meldedatum']
    _.each(dateFields, (field)=>{
        if(!schema.properties[field]){
            return
        }
        schema.properties[field].type = "date"
    })
    // Integer fields
    var dateFields = ['id','PZN']
    _.each(dateFields, (field)=>{
        if(!schema.properties[field]){
            return
        }
        schema.properties[field].type = "integer"
    })
    return schema
}
// 