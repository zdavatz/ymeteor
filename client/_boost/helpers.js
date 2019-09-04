/*


*/
// Text helper  
Template.registerHelper("truncate", function (text,n) {
    if(text && !n){
        return text.substring(0, 400)    
    }
    
    if(text && n){
        return text.substring(0, parseInt(n)) 
    }
});
// Render Array renderArr - text to array.
Template.registerHelper('renderArr', function (string) {
    console.log(string)
    if (string) {
        return string.split(',');
    }
});
Template.registerHelper('arrayify', function (obj) {
    var result = [];
    for (var key in obj) result.push({
        name: key,
        value: obj[key]
    });
    return result;
});