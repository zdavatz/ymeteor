/**
 * 
 */

BlazeLayout.setRoot('body');


FlowRouter.route('/', {
    name: 'dashApp',
    action: function () {
        BlazeLayout.render("mainLayout", {
            content: "searchResults"
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