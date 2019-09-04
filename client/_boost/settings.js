/*
    Settings Collection
    Setting Functions
    Settings Helpers
*/

/*=============================================
=            Setting Collection            =
=============================================*/
Settings = new Mongo.Collection(null);
/*=============================================
=            Startup            =
=============================================*/
Meteor.startup(function () {
    Settings.insert({
        name: 'current',
        isCurrent: true
    });
});
/*============================================= 
            Setting Actions
=============================================*/
//  Settings .
App.addSetting = function (data) {
    var isExist = Settings.findOne({
        name: data.name
    });
    if (!isExist) {
        Settings.insert(data);
    }
}
// Set The Setting as Obj.
App.setSetting = function (obj) {
    Settings.update({
        isCurrent: true
    }, {
        $set: obj
    });
}
// Get The Settings
App.getSetting = function (key) {
    var setting = Settings.findOne({
        isCurrent: true
    });
    if (setting) {
        return setting[key]
    }
}


App.setSettings = (settings)=>{
    // Settings Array of Objects
    // console.log('setSettings', settings)
    var settings = App.jsonString(settings);
    _.each(settings, (setting)=>{
        App.setSetting(setting);
    });
}
/*
    Reset Settings
    - settings Array
*/
App.resetSettings = (settings)=>{
    var settings = settings.replace(/\s/g, '');
    var settings = settings.split(',')
    _.each(settings,(i)=>{
        App.setSetting({[i]:null})
    })
}
/*

    # Push into array of Settings 
    ### ex. : as menu array

*/
App.pushSetting = (i) => {
    // { sets : {'h': new Date()}
    Settings.update({
        isCurrent: true
    }, {
        $push: i
    });
}

/*=============================================
=                // var action = Settings.findOne({
    //     command: i
    // });
    // var action = App.findSetting('command' , i)            =
=============================================*/
App.findSetting = (key,val) =>{
    var setting = Settings.findOne({[key] : val});
    return setting;
}

/*=============================================
=            Set Object as a Setting         =
=============================================*/
App.setSettingObj = (d) => {
    if (d && d.name) {
        App.setSetting({
            [d.name]: d
        })
    }
}
/*=============================================
=            App.toggleSetting            =
=============================================*/
App.toggleSetting = (setting)=>{
    var current = App.getSetting(setting);
    if (current) {
        App.setSetting({
            [setting]: false
        });
    } else {
        App.setSetting({
            [setting]: true
        })
    }
    console.log('App.toggleSetting : ',App.getSetting(setting))
}

/*============================================= 
            Setting Helpers
=============================================*/
Template.registerHelper('setting', (item, key) => {
    if (item && key) {
        var obj = App.getSetting(item);
        if (obj) {
            return obj[key]
        }
    } else if (item) {
        return App.getSetting(item)
    }
})

/*=============================================
=            Section comment block            =
=============================================*/
Template.registerHelper('getSetting', (setting) => {
    return App.getSetting(setting)
})



/*=============================================
=            Get Item Object            =
=============================================*/
Template.registerHelper('getObj', (obj, o) => {
    if (o == 'key') {
        var k = _.keys(obj)[0]
        return k;
    } else if (o == 'val') {
        var v = _.values(obj)[0]
        return v;
    }
});


// JSON UI Query
/*
    JSON Query Front end
    - t/true => true , n/null = null , f/false = false
    q = "login : t , register : n"
*/
var string = '{"id": "name2", "label": "Quantity"}'
var q = "login : t , register : f";
App.jsonString = (str) => {
    // var str = '[' + strx + ']'
    // var json = JSON.parse(strx);
    // console.log(json)
    var obj = []
    // var str = str.replace(/\s/g, '');
    var str = str.trim()
    var t = [true, 't', 'true']
    var f = [false, 'f', 'false']
    var arr = str.split(',')
    _.each(arr, (i) => {
        var o = i.split(':')
        if (_.includes(t, o[1])) {
            var p = {
                [o[0]]: true
            }
            obj.push(p)
        } else if (_.includes(f, o[1])) {
            var p = {
                [o[0]]: false
            }
            obj.push(p)
        } else {
            // console.log(o[1]);
            var p = {
                [o[0]]: o[1]
            }
            obj.push(p)
        }
    });
    return obj
}
/*
    Push Array into Setting Collection under one setting with ID
*/
App.record= (id,arr)=>{
    var r = {id:id,arr:arr};
    // console.log(r)
    App.addSetting(r)
}