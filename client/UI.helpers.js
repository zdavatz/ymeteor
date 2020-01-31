/**
 * UI. Helpers
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
 