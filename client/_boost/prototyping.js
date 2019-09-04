/*
    
*/

Template.registerHelper('repeat', function (max) {
    if(max){
        return _.range(parseInt(max)); 
    }else{
        return _.range(10); 
    }    
});