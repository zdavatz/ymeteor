import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './_boost/_import.js'

import './main.html';
import { Meteor } from 'meteor/meteor';

Items = new Mongo.Collection('items')

Meteor.startup(function(){
  Meteor.call('getFiles',function(err,data){
    App.setSetting({files:data})
    
  })
})

Template.files.onCreated(function(){

})

Template.files.helpers({
  files(){
    return  App.getSetting('files')
  }
})