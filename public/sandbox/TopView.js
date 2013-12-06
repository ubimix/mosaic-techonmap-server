define([ 'Underscore', 'Backbone' ], function(_, Backbone) {
    return Backbone.View.extend({
        renderDefault : function(el) {
            console.log('[WARN] [' + el.attr('data-render')
                    + ']: Renderer method not found. View: ', el)
        },
        doRender : function(elm, render) {
            var view = this;
            var visit = true;
            if (render !== false) {
                var renderMethodName = elm.attr('data-render');
                if (renderMethodName) {
                    elm.removeAttr('data-render');
                    var renderMethod = view[renderMethodName]
                            || view['renderDefault'];
                    if (renderMethod) {
                        var result = renderMethod.call(view, elm);
                        visit = result !== false;
                    }
                }
            }
            if (visit) {
                var list = _.toArray(elm.children());
                _.each(list, function(elm) {
                    view.doRender($(elm));
                })
            }
        },
        render : function() {
            var view = this;
            if (view.template) {
                var html = view.template({
                    view : view
                })
                view.$el.html(html);
            }
            view.doRender(this.$el);
            return this;
        }
    })
})