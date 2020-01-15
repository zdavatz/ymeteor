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
// import 'tabulator-tables';
// 
var Tabulator = require('tabulator-tables');
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
    
    if(data.meta){
        // return
        var meta = data.meta.name + ";" + data.meta.dose
        return meta;
    }else{
        return data.title
    }

    // var forecast = data.ForacastDate;

}
/** */
Template.main.onRendered(function () {
    var self = this;
    self.autorun(function () {
        var keyword = App.getSetting('keyword');
        Meteor.subscribe('searchResults', keyword)
    })
    self.autorun(function () {
        var i = Items.find().fetch()
        if (!i.length) {
            // alert("No results")
            console.log('NO results')
        }
        console.log('Results:', i.length)
        // App.setSetting({data:Items.find().fetch()})
        if (i && _.isArray(i) && i.length !== 0) {
            console.log('data', i)
            var table = new Tabulator("#meds", {
                height:"700px",
                layout:"fitColumns",
                pagination:"local",
                paginationSize:28,
                paginationSizeSelector:[3, 6, 8, 10],
                movableColumns:true,
                data: i,
                columns: [{
                        title: "Name",
                        field: "name",
                        sorter: "string"
                    },
                    {
                        title: "Project",
                        field: "project",
                        sorter: "string"
                    },
                    {
                        title: 'Meta',
                        field: 'title',
                        width: 400,
                        mutator: whoData
                    },
                    {
                        title: "Number",
                        field: "number",
                    },
                    {
                        title: "Registration Owner",
                        field: 'applicant'
                    },
                    {
                        title: "Galenic Form",
                        field: 'dosageForm'
                    },
                    {
                        title: "Registration",
                        field: 'registration'
                    },
                    {
                        title: "Transport",
                        field: 'transport'
                    },
                    {
                        title: "ATC-Code",
                        field: 'keyword'
                    },
                    {
                        title: 'AmKlassification',
                        field: 'amKlassification'
                    }
                ],
            });
        }
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
Template.main.helpers({})