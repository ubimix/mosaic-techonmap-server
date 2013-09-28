define([ 'Backbone', 'utils', 'text!./contentView.html' ],

function(Backbone, Utils, ContentViewTemplate) {

    var ResourceContentView = Backbone.View.extend({
        template : _.template(ContentViewTemplate),
        render : function() {
            var html = this.template({
                view : this
            });
            this.$el.html(html);

            return this;
        },

        /* Utility methods called by the template */
        getFormattedProperties : function() {
            var properties = this.model.attributes;
            return Utils.toStructuredContent(properties).yaml;
        },

        getFormattedContent : function() {
            var properties = this._getProperties();
            return properties.description.trim();
        },

        _getProperties : function() {
            var properties = this.model.attributes.properties || {};
            return properties;
        }

    });

    return ResourceContentView;

});