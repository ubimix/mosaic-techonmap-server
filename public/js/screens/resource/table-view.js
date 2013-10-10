define([ 'Backbone', 'Underscore', 'Handsontable', 'Leaflet', '../models/Resource', 'utils', 'text!./table-view.html' ],

function(Backbone, _, Handsontable, Leaflet, ResourceModel, Utils, ContentViewTemplate) {

    // TODO:move this model information to the Resource model attributes ?
    var geoDataModel = [ {
        title : 'Adresse',
        property : 'properties.address'
    }, {
        title : 'Code postal',
        property : 'properties.postcode',
        validator : integerValidator
    }, {
        title : 'Ville',
        property : 'properties.city'
    }, {
        title : 'Latitude',
        property : 'geometry.coordinates.1',
        validator : numberValidator
    }, {
        title : 'Longitude',
        property : 'geometry.coordinates.0',
        validator : numberValidator
    }];

    var dataModel = [ {
        title : 'Web',
        property : 'properties.url'
    }, {
        title : 'Catégorie',
        property : 'properties.category',
        getLabelFromValue: function(value) {
            return ResourceModel.categoryLabels[value]||value;
        },
        getValueFromLabel: function(value) {
            return ResourceModel.categoryLabels[value]||value;
        },
        getPossibleValues: function() {
            return _.values(ResourceModel.categoryLabels);
        }
    }, {
        title : 'Tags',
        property : 'properties.tags',
        getLabelFromValue: function(value) {
            if (!_.isArray(value)) {
                value = [];
            }
            return value.join(', ');
        },
        getValueFromLabel: function(value) {
            value = value||'';
            var array = value.split(/\s*[,;]\s*/);
            return array;
        },
    },  {
        title : 'Email',
        property : 'properties.email',
        validator : emailValidator
    }, {
        title : 'Date de création',
        property : 'properties.creationyear',
        validator : integerValidator
    }, {
        title : 'Twitter',
        property : 'properties.twitter'
    }, {
        title : 'LinkedIn',
        property : 'properties.linkedin'
    }, {
        title : 'Google+',
        property : 'properties.googleplus'
    }, {
        title : 'Facebook',
        property : 'properties.facebook'
    }, {
        title : 'Viadeo',
        property : 'properties.viadeo'
    } ];

    function emailValidator(value, callback) {
        if (/.+@.+\..+/.test(value)) {
            callback(true);
        } else {
            callback(false);
        }
    }

    function integerValidator(value, callback) {
        if (/^\d+$/.test(value)) {
            callback(true);
        } else {
            callback(false);
        }
    }

    // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
    function numberValidator(value, callback) {
        if (!isNaN(parseFloat(value)) && isFinite(value)) {
            callback(true);
        } else {
            callback(false);
        }
    }

    
    var ResourceTableView = Backbone.View.extend({
        initialize : function(options) {
            this.readOnly = this.options.readOnly ? true : false;
        },
        template : _.template(ContentViewTemplate),
        render : function() {
            var html = this.template({
                view : this
            });
            this.$el.html(html);
            
            var id = this.model.getPath();
            if (!id || id=='')
                this.$('.id').removeAttr('disabled');
            
            var readOnlyId = this._getProperties().id != '';

            var schema = dataModel;
            this.tableEditor = this._newHandsontable('.property-table', schema);

            var geoSchema = geoDataModel;
            this.geoEditor = this._newHandsontable('.geo-table', geoSchema);

            this.$('.dragdealer.horizontal').hide();
            
            var mapContainer = this.$('.map-container');
            this.map = this._newMap(mapContainer);

            return this;
        },

        _newMap : function(mapContainer) {
            var elm = mapContainer[0];
            var geometry = this.model.get('geometry');
            var map = Leaflet.map(elm, {
                center: [ geometry.coordinates[1],geometry.coordinates[0]],
                zoom: 13
            });
            
            Leaflet.tileLayer('http://{s}.tile.cloudmade.com/d4fc77ea4a63471cab2423e66626cbb6/997/256/{z}/{x}/{y}.png', {
                attribution: false,
                maxZoom: 18
            }).addTo(map);
            
            var marker = Leaflet.marker([geometry.coordinates[1], geometry.coordinates[0]]);
            marker.addTo(map);
            return map;
        },
        
        _newHandsontable : function(selector, schema) {
            var $container = this.$(selector);
            var attributes = this.model.attributes;
            
            var props = this.model.get('properties');
            var geometry = this.model.get('geometry');

            var propertyNameRenderer = function(instance, td, row, col, prop, value, cellProperties) {
                // var escaped = Handsontable.helper.stringify(value);
                td.innerHTML = '<b>' + value + '</b>';
                td.style.background = '#EEE';
                return td;
            };

            var data = [];
            var cellMetaMap = {};
            _.each(schema, function(item, index) {
                var value = Utils.selectFromObject(attributes, item.property);
                if (item.getLabelFromValue) {
                    value = item.getLabelFromValue(value);
                }
                data.push([item.title, value]);
                cellMetaMap[index] = item;
            });

            // TODO: the scope should be the elt, not the document
            // ($elt.find(...)
            // instead of $(...))
            var that = this;
            $container.handsontable({
                data : data,
                colWidths : [ 120 ],
                stretchH : 'last',
                cells : function(row, col, prop) {
                    var cellProperties = {};
                    if (col == 0 || that.readOnly) {
                        cellProperties.readOnly = true;
                    }
                    if (col == 0) {
                        cellProperties.renderer = propertyNameRenderer;
                    } else if (col == 1) {
                        var item = cellMetaMap[row];
                        if (item.getPossibleValues) {
                            cellProperties.type = 'autocomplete';
                            cellProperties.source = item.getPossibleValues();
                        }
                        if (cellMetaMap[row].validator)
                            cellProperties.validator = cellMetaMap[row].validator;
                    }
                    return cellProperties;
                }
            });
            // TODO: the scope should be the elt, not the document
            // ($elt.find(...)
            // instead of $(...))
            return $container.handsontable('getInstance');
        },

        getId : function() {
            return this._getProperties().id || '';
        },

        getDescription : function() {
            return this._getProperties().description || '';
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

        _getAttributes : function() {
            return this.model.attributes;
        },

        _getProperties : function() {
            var properties = this.model.attributes.properties || {};
            return properties;
        },

        _doUpdateModel : function(attributes, editor, schema) {
            var data = editor.getDataAtCol(1);
            var changed = false;
            _.each(schema, function(item, index) {
                var value = data[index];
                if (item.getValueFromLabel) {
                    value = item.getValueFromLabel(value);
                }
                changed |= Utils.updateObject(attributes, item.property, value);
            });
            return changed;
        },
        
        updateModel : function() {
            var copy = this.model.getCopy();
            var attributes = copy.attributes;
            var changed = false;
            changed |= this._doUpdateModel(attributes, this.tableEditor, dataModel);
            changed |= this._doUpdateModel(attributes, this.geoEditor, geoDataModel);
            
            var description = this.$('.description').val();
            changed |= Utils.updateObject(attributes, 'properties.description', description);
            
            var id = this.$('.id').val();
            changed |= Utils.updateObject(attributes, 'properties.id', id);
            if (changed) {
                // FIXME: use "validate" method to check that this field is
                // valid
            }
            
            console.log('attr', attributes);
            
            return copy;
        }
    });

    return ResourceTableView;

});