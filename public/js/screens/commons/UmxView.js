define([ 'Underscore', 'Backbone', './AsyncRender' ],

function(_, Backbone, AsyncRender) {

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
            console.log('navigate to:', path);
            if (path.indexOf('/api/') == 0) {
                alert(path)
                document.location.href= path;
            } else {
                Backbone.history.navigate(path, true);
            }
        },

        getLink : function(path) {
            if (!path)
                path = '';
            path = path.replace(/[\\\/]+/gim, '/').replace(/\s+/, '').replace(
                    /^\//g, '').replace(/\/$/gi, '');
            // FIXME: is it really required ?
            console.log(path);
            if (path.indexOf('api/') == 0) {
                path = '/' + path;
            } else {
                path = '/wiki/' + path;
            }
            return path;
        },

        doRenderLink : function(a, path) {
            path = this.getLink(path);
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
