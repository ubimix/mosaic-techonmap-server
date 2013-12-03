define([ 'Underscore', 'Backbone' ], function(_, Backbone) {
    return Backbone.View.extend({
        renderDefault : function(el) {
            console.log('[WARN] [' + el.attr('data-render')
                    + ']: Renderer method not found. View: ', el)
        },
        render : function() {
            var view = this;
            var html = view.template({
                view : view
            })
            view.$el.html(html);
            view.$el.find('[data-render]').each(function() {
                var el = $(this);
                var renderName = el.attr('data-render');
                var renderMethod = view[renderName] || view['renderDefault'];
                if (renderMethod) {
                    renderMethod.call(view, el);
                }
            })
            return this;
        }
    })
})