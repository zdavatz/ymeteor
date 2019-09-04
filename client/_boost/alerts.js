/*=============================================
=            Alerts + SweetAlert            =
    = TESTED
        - App.alert("Good job!", "You clicked the button!", "success");
        - App.alert({
                title: "Good job!",
                text: "You clicked the button!",
                icon: "success",
                button: "Aww yiss!",
            })
=============================================*/
import swal from 'sweetalert2';
App.alert = (t, m, c) => {
    if (_.isObject(t)) {
        swal(t)
    } else {
        swal(t, m, c);
    }
}
// ===========================================