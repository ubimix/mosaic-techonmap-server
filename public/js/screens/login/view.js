define([ '../commons/UmxView', 'text!./view.html' ],

function(UmxView, template) {
    var View = UmxView.extend({
        template : _.template(template),
        renderView : function() {
            return this.asyncElement(function(elm) {
                var loggedBlock = elm.find('.alreadyLogged').hide();
                var notLoggedBlock = elm.find('.notLogged').hide();
                if (this.isLogged()) {
                    loggedBlock.show();
                } else {
                    notLoggedBlock.show();
                }
            })
        },
        isLogged : function() {
            return this.options.user && this.options.user.displayName; 
        }
    });
    return View;
});
