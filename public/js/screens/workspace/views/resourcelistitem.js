define([ 'Backbone', '../../models/Validator', 'text!./resourcelistitem.html' ], function(Backbone, Validator, template) {

    var ResourceRowView = Backbone.View.extend({
        template : _.template(template),

        render : function() {
            this.$el.html(this.template({
                model : this.model,
                validator : Validator.getInstance(),
                workspace : this.options.workspace
            }));

            this.$el.find('.media-content').hide().html('');
            return this;
        }
    });

    return ResourceRowView;
});