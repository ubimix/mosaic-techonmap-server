define([ 'Backbone', 'Underscore', 'Handsontable', '../models/Resource', 'utils', 'text!./table-view.html' ],

function(Backbone, _, Handsontable, ResourceModel, Utils, ContentViewTemplate) {

    // TODO:move this model information to the Resource model attributes ?
    var dataModel = [ {
        title : 'Identifiant',
        property : 'id'
    }, {
        title : 'Nom',
        property : 'name'
    }, {
        title : 'Description',
        property : 'description'
    }, {
        title : 'Web',
        property : 'url'
    }, {
        title : 'Catégorie',
        property : 'category'
    }, {
        title : 'Tags',
        property : 'tags'
    }, {
        title : 'Adresse',
        property : 'address'
    }, {
        title : 'Code postal',
        property : 'postcode',
        validator : integerValidator
    }, {
        title : 'Email',
        property : 'email',
        validator : emailValidator
    }, {
        title : 'Ville',
        property : 'city'
    }, {
        title : 'Date de création',
        property : 'creationyear',
        validator : integerValidator
    }, {
        title : 'Twitter',
        property : 'twitter'
    }, {
        title : 'LinkedIn',
        property : 'linkedin'
    }, {
        title : 'Google+',
        property : 'googleplus'
    }, {
        title : 'Facebook',
        property : 'facebook'
    }, {
        title : 'Viadeo',
        property : 'viadeo'
    }, {
        title : 'Latitude',
        property : 'lat',
        validator : numberValidator
    }, {
        title : 'Longitude',
        property : 'lng',
        validator : numberValidator
    } ];

    var categoryMap = {
        'Entreprise' : 'entreprise',
        'Tiers-lieu' : 'third-place',
        'Incubateur' : 'incubator',
        'Investisseur' : 'investor',
        'Communauté' : 'community',
        'Prestataire' : 'prestataire',
        'École' : 'school',
        'Acteur public' : 'public-actor'
    };

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

    function newHandsontable(attributes, readOnly, readOnlyId) {
        var props = attributes.properties;

        var propertyNameRenderer = function(instance, td, row, col, prop, value, cellProperties) {
            // var escaped = Handsontable.helper.stringify(value);
            td.innerHTML = '<b>' + value + '</b>';
            td.style.background = '#EEE';
            return td;
        };

        var data = [];
        var cellMetaMap = {};
        _.each(dataModel, function(item, index) {
            if (item.property == 'lat') {
                data.push([ item.title, attributes.geometry.coordinates[1] ]);
            } else if (item.property == 'lng') {
                data.push([ item.title, attributes.geometry.coordinates[0] ]);
            } else if (item.property == 'category') {
                var flag = false;
                _.each(categoryMap, function(value, key) {
                    if (value == props[item.property]) {
                        flag = true;
                        data.push([ item.title, key ]);
                    }
                });
                if (!flag)
                    data.push([ 'Catégorie', 'Entreprise' ]);

            } else {
                data.push([ item.title, props[item.property] ]);
            }
            cellMetaMap[index] = item;
        });

        var $container = $('#example1');
        $container.handsontable({
            data : data,
            colWidths : [ 120, 300 ],
            cells : function(row, col, prop) {
                var cellProperties = {};
                if (col == 0 || readOnly) {
                    cellProperties.readOnly = true;
                }
                if (col == 0) {
                    cellProperties.renderer = propertyNameRenderer;
                } else if (col == 1) {

                    if (cellMetaMap[row].property == 'category') {
                        cellProperties.type = 'autocomplete';
                        cellProperties.source = _.keys(categoryMap);
                    }

                    if (cellMetaMap[row].validator)
                        cellProperties.validator = cellMetaMap[row].validator;

                    if (cellMetaMap[row].property == 'id' && readOnlyId) {
                        cellProperties.readOnly = true;
                    }

                }
                return cellProperties;
            }
        });

        var ht = $('#example1').handsontable('getInstance');
        return ht;

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

            var readOnlyId = this._getProperties().id != '';

            this.tableEditor = newHandsontable(this._getAttributes(), this.readOnly, readOnlyId);

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

        _getAttributes : function() {
            return this.model.attributes;
        },

        _getProperties : function() {
            var properties = this.model.attributes.properties || {};
            return properties;
        },

        updateModel : function() {
            var data = this.tableEditor.getDataAtCol(1);
            var newProps = {};
            var geometry = {
                type : 'Point',
                coordinates : []
            };
            _.each(dataModel, function(item, index) {
                if (item.property == 'lat') {
                    geometry.coordinates[1] = data[index];
                } else if (item.property == 'lng') {
                    geometry.coordinates[0] = data[index];
                } else if (item.property == 'tags') {
                    // TODO: the switch from string to populateArray should be
                    // handled through
                    // event handling at the table level
                    if (typeof data[index] == 'string') {
                        newProps[item.property] = data[index] ? data[index].split(',') : [];
                    } else {
                        newProps[item.property] = data[index];
                    }
                } else if (item.property == 'category') {
                    newProps[item.property] = categoryMap[data[index]];

                } else {
                    newProps[item.property] = data[index];
                }
            });
            
            console.log(geometry);
            this.model.set('properties', newProps);
            this.model.set('geometry', geometry);
            return this.model;
        }
    });

    return ResourceTableView;

});