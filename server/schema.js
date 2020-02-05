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

var options = {
    arrays: {
        mode: 'all'
    }
}

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
        console.log('-------------------' + files[i] + '--------------------')
        console.log('Start: ', files[i])
        var file = files[i]
        var filePath = path.join(Util.exportDir, file);
        var data = fs.readFileSync(filePath, 'utf8')
        var obj = JSON.parse(data)
        var schema = toJsonSchema(obj[0],options)
        console.log('Schema: ', file, "=>", schema)
        var fileName = file.split('.')[0] + "_schema" + '.json'
        var schemaDrugShortage = drugShortageFix(schema)
        writeSchema(fileName, schemaDrugShortage)
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
 * date
 * tageSeitErsterMeldung
 */
function drugShortageFix(schema) {
    // Date fields
    var dateFields = ['datumLetzteMutation', 'tageSeitErsterMeldung', 'datumLieferfahigkeit', 'date', 'Meldedatum']
    _.each(dateFields, (field) => {
        if (!schema || !schema.properties || !schema.properties[field]) {
            console.log('progress', "schema  DATE Fields skipped : ", field)
            return
        } else {
            console.log('Success', "schema set Date", field)
            schema.properties[field].type = "string"
            schema.properties[field].format = "date"
            console.log('validation check', field + ' = ', schema.properties[field].type, ' + ', schema.properties[field].format)
        }

    })
    // Integer fields
    var dateFields = ['id', 'PZN', 'gtin', 'pharmacode', '_id']
    _.each(dateFields, (field) => {
        if (!schema || !schema.properties || !schema.properties[field]) {
            Log('progress', "schema skipped ID Fields" + field)
            return
        } else {
            console.log('Success', "schema set Date: ", field)
            schema.properties[field].type = "string"
            schema.properties[field].format = "integer"
            console.log('validation check', field + ' = ', schema.properties[field].type, ' + ', schema.properties[field].format)
        }

    })


    if(schema && schema.properties && schema.properties.prep && !schema.properties.prep.items){
        schema.properties.prep.items = {
            "type": "object"
        }
    }
    console.log('======================================')
    console.log('Schema ready', schema)
    console.log('======================================')
    return schema
}
// 