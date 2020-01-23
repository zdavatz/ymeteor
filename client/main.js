import {
    Template
} from 'meteor/templating';
import {
    ReactiveVar
} from 'meteor/reactive-var';
import './main.html';
import {
    Meteor
} from 'meteor/meteor';
import {
    stringify
} from 'yaml';
// import 'tabulator-tables';
// 
Items = new Mongo.Collection('items')
// 
log = console.log
var whoData = function (value, data, type, params, component) {
    //value - original value of the cell
    //data - the data for the row
    //type - the type of mutation occurring  (data|edit)
    //params - the mutatorParams object from the column definition
    //component - when the "type" argument is "edit", this contains the cell component for the edited cell, otherwise it is the column component for the column
    log(data)
    if (data.meta) {
        // return
        var meta = data.meta.name + ";" + data.meta.dose
        return meta;
    } else {
        return data.title
    }
    // var forecast = data.ForacastDate;
}
/**
 * Data Field Renderer
 */
var dataFieldRenderer
/** */
Template.main.onRendered(function () {
    var self = this;
    self.autorun(function () {
        var keyword = App.getSetting('keyword');
        Meteor.subscribe('searchResults', keyword)
    })
})
/**
 * 
 */
Template.main.events({
    'keyup #search'(e) {
        var keyword = $(e.currentTarget).val()
        if (e.which === 13) {
            var keyword = keyword.toLowerCase()
            App.setSetting({
                keyword: keyword
            })
        }
    }
})
/**
 * 
 */
Template.SearchView.onCreated(function () {
    var self = this;
    self.autorun(function () {
        var keyword = App.getSetting('keyword');
        Meteor.subscribe('searchResults', keyword)
        var i = Items.find().count()
        App.setSetting({
            results: i.length
        })
        if (!i && App.getSetting('keyword')) {
            // alert("No results")
            console.log('NO results')
            App.setSetting({
                resultsCount: i
            })
        } else {
            App.setSetting({
                resultsCount: i
            })
        }
    })
})
/**
 * 
 */
Template.SearchView.events({
    'keyup #search'(e) {
        var keyword = $(e.currentTarget).val()
        if (e.which === 13) {
            var keyword = keyword.toLowerCase()
            App.setSetting({
                keyword: keyword
            })
        }
    }
})
/**
 * 
 */
Template.SearchView.helpers({
    results() {
        return Items.find({}).fetch()
    }
})
/**
 * 
 */
Template.registerHelper('countRow', (i) => {
    var i = parseInt(i) + 1
    return i
})
/** */
Template.registerHelper('readbaleBreaks', (str) => {
    if (!str) {
        return
    }
    var l = str.replace(/\Sicherheitsmerkmal Pflicht/g, "<br><strong>Sicherheitsmerkmal Pflicht</strong><br>")
    return l
})
/**
 * Data table header/ data
 */
Template.registerHelper('getDataTable', (data, type, index) => {
    //  if(!data || !type || !index){
    //      console.log('Error',"getDataTable Error")
    //      return
    //  }
    var header = []
    var stoffname = []
    var stoffmenge = []
    var rows = []
    _.each(data, (i) => {
        /**
         * Header
         */
        if (i[0] !== "ASK-Nr." || i[1] == undefined) {
            // set header
            if (header.indexOf(i[0]) == -1) {
                header.push(i[0]);
            }
            if (i[0] == 'Stoffname') {
                stoffname.push(i[1])
            }
            if (i[0] == 'Stoffmenge') {
                stoffmenge.push(i[1])
            }
        }
    })
    // Create rows
    _.each(stoffname,(r,index)=>{
        // console.log(index)
        rows.push({name:r, dose:stoffmenge[index]})
    })
    console.log(header, stoffmenge, stoffname)
    if (type == 'header') {
        return header[index]
    }
    if(type == 'rows'){
        console.log(rows)
        return rows
    }
})
/**
 * isEqual
 */
Template.registerHelper('isEqual', (v, k) => {
    if (!v || !k) {
        console.log('error: isEqual')
        return
    }
    if (v == k) {
        return true
    }
})
/**
 * isEqual
 */
Template.registerHelper('isNotEqual', (v, k) => {
    if (!v || !k) {
        console.log('error: isEqual')
        return
    }
    if (v !== k) {
        return true
    }
})