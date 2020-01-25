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
/**
 * Routes
 *        slug: FlowRouter.getParam("slug");
 */


BlazeLayout.setRoot('body');


FlowRouter.route('/', {
    name: 'dashApp',
    action: function () {
        BlazeLayout.render("dashAppLayout", {
            content: "dashApp"
        });
    }
});



FlowRouter.route('/search/results', {
    name: 'dashApp',
    action: function () {
        BlazeLayout.render("dashAppLayout", {
            content: "dashApp"
        });
    }
});


// // 
FlowRouter.notFound = {
    name: 'notFound',
    action: function () {
        BlazeLayout.render('mainLayout', {
            content: 'main'
        });
    }
};





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
 * data: Array(3)
0: (3) ["ASK-Nr.", "", ""]
1: (3) ["Stoffname", "Amlodipinbesilat", "Valsartan"]
2: (3) ["Stoffmenge", "13.87mg", "160.mg"]
//
 */
Template.registerHelper('getDataTable', (data, type, index) => {
    // Index required with header
     if(!data || !type){
         console.log('Error',"getDataTable Error")
         return
     }
    var header = []
    var stoffname = []
    var stoffmenge = []
    var rows = []
    _.each(data, (i, aindex) => {
        if (i[0] !== "ASK-Nr." || i[1] == undefined) {
            if (header.indexOf(i[0]) == -1) {
                header.push(i[0]);
            }
        }     
    })
    _.each(data[1],(r,index)=>{
        // rows.push({name:r, dose:stoffmenge[index]})
        if(index !== 0){
            rows.push({name:r, dose:data[2][index]})
        }
        

    })
    if (type == 'header') {
        return header[index]
    }
    if(type == 'rows'){
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