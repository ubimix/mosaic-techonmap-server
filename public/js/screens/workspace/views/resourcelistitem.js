define([ 'Backbone', 'text!./resourcelistitem.html' ], function(Backbone, template) {

    var ResourceRowView = Backbone.View.extend({
        template : _.template(template),

        render : function() {
            this.$el.html(this.template({
                data : this.model.toJSON(),
                workspace : this.options.workspace
            }));
            
            this.$el.find('.media-content').hide().html('');
            return this;
        }
    });

    return ResourceRowView;
});