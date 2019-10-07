import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';


import './main.html';
import { Meteor } from 'meteor/meteor';

// import 'tabulator-tables';
// 

var Tabulator = require('tabulator-tables');

Items = new Mongo.Collection('items')

// 


tabledata = [
    {id:1, name:"Billy Bob", age:12, gender:"male", height:95, col:"red", dob:"14/05/2010"},
    {id:2, name:"Jenny Jane", age:42, gender:"female", height:142, col:"blue", dob:"30/07/1954"},
    {id:3, name:"Steve McAlistaire", age:35, gender:"male", height:176, col:"green", dob:"04/11/1982"},
];
Template.main.onRendered(function(){

    // Meteor.setInterval(()=>{
    //     Meteor.call('stats',(err,data)=>{
    //         console.log(data)
    //     })
    // },5000)




    Tracker.autorun(function(){
        var i = App.getSetting('data')
        if(!i)return;
        var table = new Tabulator("#meds", {
            data:i,
            columns:[
                {title:"Name", field:"name", sorter:"string"},
                {title:'Title',field:'title' ,width:100},
                {title:"number", field:"number",},
                {title:"Applicant", field:'applicant'},
                {title:"DosageForm",field:'dosageForm'},
                {title:"Registration",field:'registration'},
                {title:"Transport",field:'transport'},
                {title:"keyword",field:'keyword'},
                {title:'AmKlassification', field:'amKlassification'}
            ],
        });
    
    })
    
    //define table


     var self = this;
     self.autorun(function(){
        var keyword = App.getSetting('keyword');
        Meteor.subscribe('searchResults',keyword)
     })

     self.autorun(function(){
        var items = Items.find().fetch()
        App.setSetting({data:Items.find().fetch()})
     })

    

})
//
Template.main.events({
    'keyup #search'(e){
        var keyword = $(e.currentTarget).val()
        if(e.which === 13){
            App.setSetting({keyword:keyword})
        }
    }
})

// 
Template.main.helpers({

})



  