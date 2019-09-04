/*
    - Using Body events.
*/
Template.body.events({
    'click .runModal': (e) => {
        e.preventDefault();
        var modal = $(e.currentTarget).attr('data-modal');
        var options = $(e.currentTarget).attr('data-id');
        App.modal(modal, options)
    },
    'click .call': (e) => {
        e.preventDefault();
        // <label class="checkbox call" data-call="realtimeCheck" data-options="item" data-response="realtimeResponse">
        var method = $(e.currentTarget).attr('data-call');
        var options = App.getSetting($(e.currentTarget).attr('data-options'));
        var response = $(e.currentTarget).attr('data-response');
        console.log('Actions .call : ', method, options, response)
        if (method && options && response) {
            App.runMethod(method, options, response);
        }
    },
    'click .setSetting': (e) => {
        e.preventDefault();
        var setting = $(e.currentTarget).attr('data-setting');
        var value = $(e.currentTarget).attr('data-val');
        App.setSetting({
            [setting]: value
        });
    },
    'click .setSettings': (e) => {
        e.preventDefault();
        var settings = $(e.currentTarget).attr('data-settings');
        console.log('event SetSettings : ', settings)
        App.setSettings(settings);
    },
    'click .submitForm': (e) => {
        e.preventDefault();
        var id = $(e.currentTarget).parents("form").attr('id');
        var data = App.getFormData('#' + id);
        data.hasData = true;
        if (App.getSetting('formType') == 'custom') {
            console.log('app.control.js submitForm : Custom Form')
            data.data = App.getSetting('formData');
        }
        // actions : commands/ methods/
        var i = $('#inputCommand').val()
        if (i) {
            App.command(data);
            App.loading(true, 300);
            // [FIX] App.setDefault('settingValue')
            App.setSetting({
                actionTemplate: 'scrapForm'
            })
        } else {
            console.log(data)
            Bert.alert('There is NO command', 'warning');
        }
    },
    'click .toggleSetting': (e) => {
        e.preventDefault();
        var setting = $(e.currentTarget).attr('data-setting');
        App.toggleSetting(setting)
    },
})