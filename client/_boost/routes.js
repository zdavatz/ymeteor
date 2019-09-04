/*
    Routes
*/
BlazeLayout.setRoot('body');
// NOTFOUND
FlowRouter.notFound = {
    name: 'notFound',
    action: function () {
        // BlazeLayout.render('notFound');
        FlowRouter.go('/login')
    }
};
// Template.notFound.onRendered(()=>{
//     FlowRouter.go('/login');
// })
// Routes = [];
// var editor = {
//     name: 'home',
//     url: '/',
//     template: 'home',
//     layout: 'mainLayout'
// }
// // Routes.push(editor)
// _.each(Routes, function (route) {
//     FlowRouter.route(route.url, {
//         name: route.name,
//         action: function () {
//             BlazeLayout.render(route.layout, {
//                 content: route.template
//             });
//         }
//     });
// });
// App.route = function (route) {
//     Routes.push(route)
// }