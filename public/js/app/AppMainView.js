define([ 'Underscore', 'jQuery', '../commons/UmxView',
        './AppHeaderView', 'text!./AppMainView.html' ],

function(_, $, UmxView, AppHeaderView, AppMainViewTemplate) {

    var View = UmxView.extend({

        template : _.template(AppMainViewTemplate),

        renderHeader : function(elm) {
            var user = this.$el.data('user');
            var roles = this.$el.data('user-role');
            this.headerView = new AppHeaderView({
                user : user,
                el : elm
            });
            this.headerView.render();
        },

        renderScreenView : function(elm) {
            this.screenContainer = elm;
        },

        show : function(view) {
            if (this.view) {
                if (this.view.dispose) {
                    this.view.dispose();
                }
                this.view.$el.remove();
                delete this.view;
            }
            this.view = view;
            if (this.view) {
                this.screenContainer.append(this.view.$el);
                this.view.render();
            }
        }
    });
    return View;

});
