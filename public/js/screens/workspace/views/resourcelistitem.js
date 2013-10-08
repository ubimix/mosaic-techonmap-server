define([ 'Backbone', 'utils', '../../models/Validator', 'text!./resourcelistitem.html' ],

function(Backbone, Utils, Validator, template) {

    var ResourceRowView = Backbone.View.extend({
        template : _.template(template),

        render : function() {
            this.$el.html(this.template({
                model : this.model,
                validator : Validator.getInstance(),
                workspace : this.options.workspace,
                view : this
            }));

            this.$el.find('.media-content').hide().html('');
            return this;
        },

        getFormattedUpdateTime : function() {
            return Utils.formatDate(this.model.getUpdated().timestamp);
        }
    });

    return ResourceRowView;
});