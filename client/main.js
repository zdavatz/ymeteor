import {
    Template
} from 'meteor/templating';
import {
    ReactiveVar
} from 'meteor/reactive-var';
import './main.html';
import './search.html'
import './_layout.html'
import './UI.helpers.js'
import './_routes.js'
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
/**
 *  MainLayout Renderer
 */
Template.mainLayout.onCreated(function () {
    var self = this;
    self.autorun(function () {
        
        var keyword = App.getSetting('keyword');
        if(!keyword && FlowRouter.getParam("keyword")){
            var keyword = FlowRouter.getParam("keyword")
            App.setSetting({keyword:keyword})
        }
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
Template.mainLayout.events({
    'keyup #search'(e) {
        var keyword = $(e.currentTarget).val()
        if (e.which === 13) {
            var keyword = keyword.toLowerCase()
            App.setSetting({
                keyword: keyword
            })
            /**Nice URL setting */
            FlowRouter.go('/search/results/:keyword', {
                keyword: keyword
            })


        }
    }
})
/**
 * 
 */
Template.searchResults.helpers({
    results() {
        return Items.find({}).fetch()
    }
})
