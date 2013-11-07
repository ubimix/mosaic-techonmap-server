define(
        [ '../commons/UmxView', 'Underscore', 'Handsontable', 'Leaflet',
                '../models/Resource', 'utils', 'text!./table-view.html' ],

        function(UmxView, _, Handsontable, Leaflet, ResourceModel, Utils,
                ContentViewTemplate) {

            // TODO:move this model information to the Resource model attributes
            // ?
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
            } ];

            var dataModel = [ {
                title : 'Web',
                property : 'properties.url',
                renderer : linkRenderer
            }, {
                title : 'Catégorie',
                property : 'properties.category',
                getLabelFromValue : function(value) {
                    return ResourceModel.categoryLabels[value] || value;
                },
                getValueFromLabel : function(label) {
                    var result = label;
                    _.each(ResourceModel.categoryLabels, function(value, key) {
                        if (label == value) {
                            result = key;
                        }
                    });
                    return result;

                },
                getPossibleValues : function() {
                    return _.values(ResourceModel.categoryLabels);
                }
            }, {
                title : 'Tags',
                property : 'properties.tags',
                getLabelFromValue : function(value) {
                    if (!_.isArray(value)) {
                        value = [];
                    }
                    return value.join(', ');
                },
                getValueFromLabel : function(value) {
                    value = value || '';
                    var array = value.split(/\s*[,;]\s*/);
                    return array;
                },
            }, {
                title : 'Email',
                property : 'properties.email',
                validator : emailValidator
            }, {
                title : 'Date de création',
                property : 'properties.creationyear',
                validator : integerValidator
            }, {
                title : 'Twitter',
                property : 'properties.twitter',
                renderer : twitterRenderer
            }, {
                title : 'LinkedIn',
                property : 'properties.linkedin',
                renderer : linkRenderer
            }, {
                title : 'Google+',
                property : 'properties.googleplus',
                renderer : linkRenderer
            }, {
                title : 'Facebook',
                property : 'properties.facebook',
                renderer : linkRenderer
            }, {
                title : 'Viadeo',
                property : 'properties.viadeo',
                renderer : linkRenderer
            }, {
                title : 'Permalien',
                property : 'permalink',
                isPersistent : false,
                renderer : linkRenderer
            } ];

            /**
             * -------------------------- VALIDATORS
             * ---------------------------------
             */

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

            /**
             * -------------------------- RENDERERS
             * ---------------------------------
             */

            function propertyNameRenderer(instance, td, row, col, prop, value,
                    cellProperties) {
                // var escaped = Handsontable.helper.stringify(value);
                td.innerHTML = value;
                // td.style.background = '#EEE';
                td.style.color = 'gray';
                return td;
            }

            function linkRenderer(instance, td, row, col, prop, value,
                    cellProperties) {
                if (value) {
                    var href = value;
                    if (value.indexOf('http') != 0) {
                        href = 'http://' + value;
                    }
                    td.innerHTML = '<a href="' + href + '">' + value + '</a>';
                }
                return td;

            }

            function twitterRenderer(instance, td, row, col, prop, value,
                    cellProperties) {
                if (value) {
                    var href = value;
                    if (value.indexOf('http') != 0) {
                        href = 'https://twitter.com/' + value;
                    }
                    td.innerHTML = '<a href="' + href + '">' + value + '</a>';
                }
                return td;

            }

            /**
             * -------------------------- TABLE VIEW
             * ---------------------------------
             */

            var TILE_SERVER_URL = 'http://{s}.tile.cloudmade.com/d4fc77ea4a63471cab2423e66626cbb6/997/256/{z}/{x}/{y}.png';
            var ResourceTableView = UmxView
                    .extend({
                        template : _.template(ContentViewTemplate),

                        initialize : function(options) {
                            this.readOnly = this.options.readOnly === true;
                        },

                        renderIdField : function() {
                            return this.asyncElement(function(elm) {
                                this.idFieldElm = elm;
                                var path = this.getPath();
                                this.idFieldElm.val(path);
                                if (this.model.isNew()) {
                                    this.idFieldElm.removeAttr('disabled');
                                }
                            })
                        },

                        renderDescription : function() {
                            return this.asyncElement(function(elm) {
                                this.contentEditor = Utils
                                        .newCodeMirror(elm.get(0), {
                                            lineNumbers : false
                                        }, this.options.readOnly, this
                                                .getDescription());
                            })
                        },

                        renderPropertyTable : function() {
                            return this.asyncElement(function(elm) {
                                this.tableEditor = this._newHandsontable(elm,
                                        dataModel);
                            })
                        },

                        renderGeoTable : function() {
                            return this.asyncElement(function(elm) {
                                this.geoEditor = this._newHandsontable(elm,
                                        geoDataModel);
                            })
                        },

                        renderMap : function() {
                            return this.asyncElement(function(elm) {
                                this.map = this._newMap(elm);
                            })
                        },


                        _newMap : function(mapContainer) {
                            var elm = mapContainer[0];
                            var geometry = this.model.get('geometry');
                            var map = Leaflet.map(elm, {
                                center : [ geometry.coordinates[1],
                                        geometry.coordinates[0] ],
                                zoom : 12
                            });

                            Leaflet.tileLayer(TILE_SERVER_URL, {
                                attribution : false,
                                maxZoom : 18
                            }).addTo(map);

                            var marker = Leaflet.marker([
                                    geometry.coordinates[1],
                                    geometry.coordinates[0] ]);
                            marker.addTo(map);
                            return map;
                        },

                        _newHandsontable : function($container, schema) {
                            var attributes = this.model.attributes;

                            var props = this.model.get('properties');
                            var geometry = this.model.get('geometry');

                            var data = [];
                            var id = this.getPath();
                            var cellMetaMap = {};
                            _.each(schema, function(item, index) {
                                var value = '';
                                if (item.isPersistent != undefined
                                        && !item.isPersistent) {
                                    value = 'http://techonmap.fr/#' + id;
                                } else {
                                    value = Utils.selectFromObject(attributes,
                                            item.property);
                                    if (item.getLabelFromValue) {
                                        value = item.getLabelFromValue(value);
                                    }

                                }
                                data.push([ item.title, value ]);
                                cellMetaMap[index] = item;
                            });

                            // data.push(['Permalien',
                            // 'http://techonmap.fr/#'+id]);

                            // TODO: the scope should be the elt, not the
                            // document
                            // ($elt.find(...)
                            // instead of $(...))
                            var that = this;
                            $container
                                    .handsontable({
                                        data : data,
                                        colWidths : [ 130 ],
                                        stretchH : 'last',
                                        multiSelect : false,
                                        fillHandle : false,
                                        cells : function(row, col, prop) {
                                            var cellProperties = {};
                                            if (col == 0 || that.readOnly) {
                                                cellProperties.readOnly = true;
                                            }
                                            if (col == 0) {
                                                cellProperties.renderer = propertyNameRenderer;
                                            } else if (col == 1) {
                                                var item = cellMetaMap[row];
                                                // item may be null for
                                                // properties like 'permalink'
                                                // which are added only for
                                                // display
                                                var linkProperties = [
                                                        'permalink',
                                                        'properties.url',
                                                        'properties.linkedin',
                                                        'properties.viadeo',
                                                        'properties.facebook' ];

                                                if (_.indexOf(linkProperties,
                                                        item.property) >= 0) {
                                                    cellProperties.renderer = linkRenderer;
                                                } else if (item.property == 'properties.twitter') {
                                                    cellProperties.renderer = twitterRenderer;
                                                } else if (item.getPossibleValues) {
                                                    cellProperties.type = 'autocomplete';
                                                    cellProperties.source = item
                                                            .getPossibleValues();
                                                }
                                                if (cellMetaMap[row].validator)
                                                    cellProperties.validator = cellMetaMap[row].validator;
                                            }
                                            return cellProperties;
                                        }
                                    });
                            // TODO: the scope should be the elt, not the
                            // document
                            // ($elt.find(...)
                            // instead of $(...))
                            return $container.handsontable('getInstance');
                        },

                        getPath : function() {
                            var path = this.model.getId();
                            path = path != '' ? path : this.options.path;
                            return path;
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
                            var properties = this.model.attributes.properties
                                    || {};
                            return properties;
                        },

                        _doUpdateModel : function(attributes, editor, schema) {
                            var data = editor.getDataAtCol(1);
                            var changed = false;
                            _.each(schema, function(item, index) {
                                var value = data[index];
                                if (item.getValueFromLabel) {
                                    value = item.getValueFromLabel(value);
                                }
                                changed |= Utils.updateObject(attributes,
                                        item.property, value);
                            });
                            return changed;
                        },

                        updateModel : function() {
                            var copy = this.model.getCopy();
                            var attributes = copy.attributes;
                            var changed = false;
                            changed |= this._doUpdateModel(attributes,
                                    this.tableEditor, dataModel);
                            changed |= this._doUpdateModel(attributes,
                                    this.geoEditor, geoDataModel);

                            var description = this.contentEditor.getValue();
                            changed |= Utils.updateObject(attributes,
                                    'properties.description', description);

                            var id = this.idFieldElm.val();
                            changed |= Utils.updateObject(attributes,
                                    'properties.id', id);
                            if (changed) {
                                // FIXME: use "validate" method to check that
                                // this field is
                                // valid
                            }

                            return copy;
                        }
                    });

            return ResourceTableView;

        });