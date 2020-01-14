import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './main.html';
import { Meteor } from 'meteor/meteor';
// import 'tabulator-tables';
// 
var Tabulator = require('tabulator-tables');
Items = new Mongo.Collection('items')
// 
Template.main.onRendered(function(){
     var self = this;
     self.autorun(function(){
        var keyword = App.getSetting('keyword');
        Meteor.subscribe('searchResults',keyword)
     })
     self.autorun(function(){
        var i = Items.find().fetch()
        if(!i.length){
            // alert("No results")
            console.log('NO results')
        }

        console.log('Results:' , i.length)
        // App.setSetting({data:Items.find().fetch()})
        if(i && _.isArray(i) && i.length !== 0){
            console.log('data',i)
            var table = new Tabulator("#meds", {
                data:i,
                columns:[
                    {title:"Name", field:"name", sorter:"string"},
                    {title:'Meta',field:'title' ,width:400},
                    {title:"Number", field:"number",},
                    {title:"Registration Owner", field:'applicant'},
                    {title:"Galenic Form",field:'dosageForm'},
                    {title:"Registration",field:'registration'},
                    {title:"Transport",field:'transport'},
                    {title:"ATC-Code",field:'keyword'},
                    {title:'AmKlassification', field:'amKlassification'}
                ],
            });
        }
     })
})
/**
 * 
 */
Template.main.events({
    'keyup #search'(e){
        var keyword = $(e.currentTarget).val()
        if(e.which === 13){
            var keyword = keyword.toLowerCase()
            App.setSetting({keyword:keyword})
        }
    }
})
// 
Template.main.helpers({
})
