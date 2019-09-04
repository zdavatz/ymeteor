/*
    App.Functions Common Functions to use in the App.

    == Form
    == Form Validations.
    == Spinner Action ( used with Spinner )
    == FlowRouter Specifics
    == 
*/

App.getFormData = function (form) {
    var values = {};
    // ALL ITEM FIELDS.
    $.each($(form).serializeArray(), function (i, field) {
        values[field.name] = field.value;
    });
    $(form).find('input[type=radio]:checked').each(function (id, item, value) {
        var val = $(item).val()
        var $item = $(item);
        var name = $item.attr('name');
        var value = $item.is(":checked")
        var type = $item.val()
        //        if ($item.is(":checked")) {
        //            values[name] = $item.is(":checked").attr('id');
        //        } 
        values[name] = type;
    });
    return values
}