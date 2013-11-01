define([ 'Underscore', 'Backbone', './LinkController', './AsyncRender' ],

function(_, Backbone, LinkController, AsyncRender) {

    var View = Backbone.View.extend();
    _.extend(View.prototype, AsyncRender.prototype, {

        render : function() {
            var html = this.template({
                view : this
            })
            this.$el.html(html);
            this.callAsyncHandlers(this.$el);
            return this;
        },

        navigateTo : function(path) {
            var linkController = LinkController.getInstance();
            return linkController.navigateTo(path);
        },

        getLink : function(path) {
            var linkController = LinkController.getInstance();
            return linkController.getLink(path);
        },

        doRenderHistoryLink : function(a, path, version1, version2) {
            var linkController = LinkController.getInstance();
            path = linkController.getHistoryLink(path, version1, version2);
            this._setLinkAttributes(a, path);
        },

        doRenderLink : function(a, path) {
            var linkController = LinkController.getInstance();
            path = linkController.getLink(path);
            this._setLinkAttributes(a, path);
        },
        _setLinkAttributes : function(a, path) {
            a.attr('href', path);
            var that = this;
            a.click(function(event) {
                that.navigateTo(path);
                event.preventDefault();
                event.stopPropagation();
            })
        },

        renderLink : function(path) {
            return this.asyncElement(function(a) {
                this.doRenderLink(a, path);
            })
        }

    });

    return View;

})
