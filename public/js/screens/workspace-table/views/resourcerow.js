define([ 'Backbone', 'text!./resourcerow.html' ], function(Backbone, template) {

    var ResourceRowView = Backbone.View.extend({
        tagName : 'tr',
        template : _.template(template),

        render : function() {
            this.$el.html(this.template({
                data : this.model.toJSON(),
                workspace : this.options.workspace
            }));
            return this;
        }
    });

    return ResourceRowView;
});