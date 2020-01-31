/**
 * 
 */

BlazeLayout.setRoot('body');


FlowRouter.route('/', {
    name: 'mainPage',
    action: function () {
        BlazeLayout.render("mainLayout", {
            content: "searchResults"
        });
    }
});



FlowRouter.route('/search/:keyword', {
    name: 'searchResults',
    action: function () {
        BlazeLayout.render("mainLayout", {
            content: "searchResults"
        });
    }
});


// // 
FlowRouter.notFound = {
    name: 'notFound',
    action: function () {
        BlazeLayout.render('mainLayout', {
            content: 'notFound'
        });
    }
};