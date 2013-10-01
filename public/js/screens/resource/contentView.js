define([ 'Backbone', '../models/Resource', 'utils', 'text!./contentView.html' ],

function(Backbone, ResourceModel, Utils, ContentViewTemplate) {

    var ResourceContentView = Backbone.View.extend({
        initialize : function(options) {
            _.bindAll(this, 'beforeRender', 'render', 'afterRender');
            var _this = this;
            this.render = _.wrap(this.render, function(render) {
                _this.beforeRender();
                render();
                _this.afterRender();
                return _this;
            });
        },
        template : _.template(ContentViewTemplate),
        render : function() {
            console.log('in render');
            var html = this.template({
                view : this
            });
            this.$el.html(html);

            return this;

        },

        /* Utility methods called by the template */
        getFormattedProperties : function() {
            // FIXME
            var properties = this.model.attributes;
            var yaml = Utils.toStructuredContent(properties).yaml;
            return yaml;
        },

        getFormattedContent : function() {
            var properties = this._getProperties();
            return properties.description.trim();
        },

        _getProperties : function() {
            var properties = this.model.attributes.properties || {};
            return properties;
        },

        updateModel : function() {
            // var yaml = this.propertiesEditor.getValue();
            // var description = this.contentEditor.getValue();
            var yaml = propertiesEditor.getValue();
            var description = contentEditor.getValue();
            var json = Utils.toJSON(description, yaml);
            this.model.set('properties', json);
            return this.model;
        },

        doLayout : function($el) {
            // TODO: create editors here instead of having them in the template

        },
        beforeRender : function() {
            console.log('beforeRender');
        },
        afterRender : function() {
            console.log('afterRender');
            console.log(this.$el.find('.content'));
//            var contentEditor = CodeMirror.fromTextArea(this.$el.find('.content').get(0), {
//                lineNumbers : true,
//                viewportMargin : Infinity,
//                lineWrapping : true
//            });
           
            
            
            
        }

    });

    return ResourceContentView;

});