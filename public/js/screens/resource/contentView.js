define([ 'Backbone', 'Underscore', '../models/Resource', 'utils', 'text!./contentView.html' ],

function(Backbone, _, ResourceModel, Utils, ContentViewTemplate) {

    function newCodeMirror(elt, options, readOnly, value) {
        options = options || {};
        var defaultOptions = {
            lineNumbers : true,
            viewportMargin : Infinity,
            lineWrapping : true,
            mode : 'text',
            readOnly : readOnly,
            height : '100%'
        };
        options = _.extend(defaultOptions, options);
        var editor = new CodeMirror(elt, options);
        editor.setValue(value);
        return editor;
    }

    var ResourceContentView = Backbone.View.extend({
        initialize : function(options) {
            this.readOnly = this.options.readOnly ? 'nocursor' : false;
        },
        template : _.template(ContentViewTemplate),
        render : function() {
            var html = this.template({
                view : this
            });
            this.$el.html(html);

            var formattedContent = this.getFormattedContent();
            // FIXME: put readOnly in options directly
            this.contentEditor = newCodeMirror($('.content').get(0), null, this.readOnly, formattedContent);
            this.propertiesEditor = newCodeMirror($('.properties').get(0), {
                mode : 'yaml',
                lineNumbers : false
            }, this.readOnly, this.getFormattedProperties());
            $(this.propertiesEditor.getWrapperElement()).addClass('properties');

            var lineNumbers  =formattedContent.split('\n').length;
            this.contentEditor.focus();
            this.contentEditor.setCursor(lineNumbers);    
            return this;

        },

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
            var yaml = this.propertiesEditor.getValue();
            var description = this.contentEditor.getValue();
            var json = Utils.toJSON(description, yaml);
            this.model.set('properties', json);
            return this.model;
        }

    });

    return ResourceContentView;

});