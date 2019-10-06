import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';


import './main.html';
import { Meteor } from 'meteor/meteor';

Items = new Mongo.Collection('items')

// 
Template.main.onRendered(function(){

    // Meteor.setInterval(()=>{
    //     Meteor.call('stats',(err,data)=>{
    //         console.log(data)
    //     })
    // },5000)

     var self = this;
     self.autorun(function(){
        var keyword = App.getSetting('keyword');
        console.log(keyword)
        Meteor.subscribe('searchResults',keyword)
     })

    

})
//
Template.main.events({
    'keyup #search'(e){
        var keyword = $(e.currentTarget).val()
        
        // 
        if(e.which === 13){
            App.setSetting({keyword:keyword})
            // Meteor.call('search', keyword ,(err,data)=>{
            //     if(err) return;
            //     App.setSetting({results:data})
            // })
        }
    }
})

// 
Template.main.helpers({
    items(){
        return Items.find()
    }
})



  