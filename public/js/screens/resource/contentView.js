define([ '../commons/UmxView', 'Backbone', 'Underscore', 'CodeMirror',
        'CodeMirrorYaml', '../models/Resource', 'utils',
        'text!./contentView.html' ],

function(UmxView, Backbone, _, CodeMirror, CodeMirrorYaml, ResourceModel,
        Utils, ContentViewTemplate) {

    var ResourceContentView = UmxView.extend({
        template : _.template(ContentViewTemplate),

        initialize : function(options) {
            this.readOnly = this.options.readOnly ? 'nocursor' : false;
        },

        renderContent : function() {
            console.log('renderContent')
            return this.asyncElement(function(elm) {
                // FIXME: put readOnly in options directly
                var formattedContent = this.getFormattedContent();
                this.contentEditor = Utils.newCodeMirror(elm[0], null,
                        this.readOnly, formattedContent);
                var lineNumbers = formattedContent.split('\n').length;
                this.contentEditor.focus();
                this.contentEditor.setCursor(lineNumbers);
            })
        },

        renderProperties : function() {
            return this.asyncElement(function(elm) {
                this.propertiesEditor = Utils.newCodeMirror(elm[0], {
                    mode : 'yaml',
                    lineNumbers : false
                }, this.readOnly, this.getFormattedProperties());
                $(this.propertiesEditor.getWrapperElement()).addClass(
                        'properties');
            })
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
            // FIXME: geometry is not in the properties but in the
            // attributes
            return this.model;
        }

    });

    return ResourceContentView;

});