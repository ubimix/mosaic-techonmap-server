define([ '../../commons/UmxView', 'text!./view.html' ],

function(UmxView, template) {
    var View = UmxView.extend({
        template : _.template(template),
        renderNotLoggedBlock : function(elm) {
            if (this.isLogged()) {
                elm.hide();
            } else {
                elm.show();
            }
        },
        renderAlreadyLoggedBlock : function(elm) {
            if (this.isLogged()) {
                elm.show();
            } else {
                elm.hide();
            }
        },
        isLogged : function() {
            // FIXME: check the role of the user
            return this.options.user && this.options.user.displayName;
        }
    });
    return View;
});
