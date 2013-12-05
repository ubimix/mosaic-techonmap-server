define(
        [ '../commons/UmxView', 'Underscore', 'Handsontable', 'Leaflet',
                '../models/Resource', 'utils', 'text!./table-view.html' ],

        function(UmxView, _, Handsontable, Leaflet, ResourceModel, Utils,
                ContentViewTemplate) {

            var DEFAULT_MAP_CENTER = [ 2.351932525634765, 48.85666816723737 ];
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
                // readOnly : true,
                validator : numberValidator,
                renderer : getCoordsRenderer(DEFAULT_MAP_CENTER[1])
            }, {
                title : 'Longitude',
                property : 'geometry.coordinates.0',
                // readOnly : true,
                validator : numberValidator,
                renderer : getCoordsRenderer(DEFAULT_MAP_CENTER[0])
            } ];

            // Serializing: getLabelFromValue => renderer
            // Deserializing: getValueFromLabel => validator
            var dataModel = [ {
                title : 'Web',
                property : 'properties.url',
                renderer : linkRenderer
            }, {
                title : 'Catégorie',
                property : 'properties.category',
                getLabelFromValue : function(value, model) {
                    return ResourceModel.categoryLabels[value] || value;
                },
                getValueFromLabel : function(label, model) {
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
                getLabelFromValue : function(value, model) {
                    if (!_.isArray(value)) {
                        value = [];
                    }
                    return value.join(', ');
                },
                getValueFromLabel : function(value, model) {
                    value = value || '';
                    var array = value.split(/\s*[,;]\s*/);
                    return array;
                },
            }, {
                title : 'Email',
                property : 'properties.email',
                validator : emailValidator,
                renderer : linkRenderer
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
                property : 'properties.id',
                isPersistent : false,
                renderer : linkRenderer,
                getLabelFromValue : function(value, model, view) {
                    var path = view.getPath();
                    return 'http://techonmap.fr/#' + path;
                },
                getValueFromLabel : function(label, model, view) {
                    return undefined;
                }
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
                    var idx = value.indexOf('mailto:');
                    if (idx >= 0) {
                        value = value.substring(idx + 'mailto:'.length);
                    } else if (value.indexOf('http') != 0) {
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

            function getCoordsRenderer(defaultValue) {
                return function(instance, td, row, col, prop, value,
                        cellProperties) {
                    value = value || defaultValue;
                    td.innerHTML = value;
                    return td;
                }
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

                        renderIdField : function(elm) {
                            this.idFieldElm = elm;
                            var path = this.getPath();
                            this.idFieldElm.val(path);
                            if (this.model.isNew()) {
                                this.idFieldElm.removeAttr('disabled');
                            }
                        },

                        isReadonly : function() {
                            return this.options.readOnly === true;
                        },

                        renderDescription : function(elm) {
                            this.contentEditor = Utils
                                    .newCodeMirror(elm.get(0), {
                                        lineNumbers : false
                                    }, this.isReadonly(), this.getDescription());
                        },

                        renderPropertyTable : function(elm) {
                            this.tableEditor = this._newHandsontable(elm,
                                    dataModel);
                        },

                        renderGeoTable : function(elm) {
                            this.geoEditor = this._newHandsontable(elm,
                                    geoDataModel);
                            var latRow = -1;
                            var lngRow = -1;
                            _.each(geoDataModel, function(item, index) {
                                switch (item.property) {
                                case 'geometry.coordinates.0':
                                    lngRow = index;
                                    break;
                                case 'geometry.coordinates.1':
                                    latRow = index;
                                    break;
                                }
                            });
                            var that = this;
                            var onCellChange = function(ev) {
                                var lat = that.geoEditor.getDataAtCell(latRow,
                                        1);
                                var lng = that.geoEditor.getDataAtCell(lngRow,
                                        1);
                                var changed = false;
                                _.each(ev, function(change) {
                                    var row = change[0];
                                    var col = change[1];
                                    if (col != 1)
                                        return;
                                    var oldVal = change[2];
                                    var newVal = parseFloat(change[3]);
                                    if (row == latRow) {
                                        lat = newVal;
                                        changed = true;
                                    } else if (row == lngRow) {
                                        lng = newVal;
                                        changed = true;
                                    }
                                });
                                if (changed) {
                                    that._updateCoordinates(lng, lat);
                                }
                            }
                            this.geoEditor.addHook('afterChange', onCellChange);
                            this.on('coords:changed', function(evt) {
                                that.geoEditor.setDataAtCell(latRow, 1,
                                        evt.coords[1]);
                                that.geoEditor.setDataAtCell(lngRow, 1,
                                        evt.coords[0]);
                            })
                        },

                        renderMap : function(mapContainer) {
                            this.map = this._newMap(mapContainer);
                        },

                        _getCoordinates : function() {
                            var geometry = this.model.get('geometry');
                            var coords = geometry.coordinates
                                    && geometry.coordinates.length ? geometry.coordinates
                                    : [ DEFAULT_MAP_CENTER[0],
                                            DEFAULT_MAP_CENTER[1] ];
                            return coords;
                        },

                        _newMap : function(mapContainer) {
                            var that = this;
                            var elm = mapContainer[0];
                            var coords = this._getCoordinates();
                            var center = L.latLng(coords[1], coords[0]);
                            var map = Leaflet.map(elm, {
                                center : center,
                                zoom : 12
                            });
                            Leaflet.tileLayer(TILE_SERVER_URL, {
                                attribution : false,
                                maxZoom : 18
                            }).addTo(map);

                            var editable = !this.isReadonly();
                            var marker = Leaflet.marker(center, {
                                draggable : editable
                            });
                            marker.addTo(map);
                            if (editable) {
                                that.on('coords:changed', function(evt) {
                                    var latlng = L.latLng(evt.coords[1],
                                            evt.coords[0]);
                                    marker.setLatLng(latlng);
                                });
                                marker.on('dragend', function(ev) {
                                    var latlng = marker.getLatLng();
                                    that._updateCoordinates(latlng.lng,
                                            latlng.lat);
                                })
                            }
                            return map;
                        },

                        _updateCoordinates : function(lng, lat) {
                            if (!this._updatesBlocked) {
                                try {
                                    this._updatesBlocked = true;
                                    var updateId = // 
                                    this._updateId = (this._updateId ? this._updateId++
                                            : 1);
                                    this.trigger('coords:changed', {
                                        id : updateId,
                                        coords : [ lng, lat ]
                                    });
                                } finally {
                                    this._updatesBlocked = false;
                                }
                            }
                        },

                        _newHandsontable : function($container, schema) {
                            var that = this;
                            var attributes = this.model.attributes;
                            var props = this.model.get('properties');
                            var geometry = this.model.get('geometry');
                            var data = [];
                            var id = this.getPath();
                            var model = this.model;
                            var cellMetaMap = [];
                            _.each(schema, function(item, index) {
                                var value = Utils.selectFromObject(attributes,
                                        item.property);
                                if (item.getLabelFromValue) {
                                    value = item.getLabelFromValue(value,
                                            model, that);
                                }
                                data.push([ item.title, value ]);
                                cellMetaMap[index] = item;
                            });
                            var options = {
                                parent : that,
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
                                        if (item.readOnly) {
                                            cellProperties.readOnly = true;
                                        }
                                        var renderer = item.renderer;
                                        if (renderer) {
                                            cellProperties.renderer = renderer;
                                        }
                                        if (item.getPossibleValues) {
                                            cellProperties.type = 'autocomplete';
                                            cellProperties.source = item
                                                    .getPossibleValues();
                                        }
                                        if (cellMetaMap[row].validator) {
                                            cellProperties.validator = cellMetaMap[row].validator;
                                        }
                                    }
                                    return cellProperties;
                                }
                            };
                            $container.handsontable(options);
                            var instance = $container
                                    .handsontable('getInstance');
                            instance.parent = that;
                            instance.loadData(data);
                            return instance;
                        },

                        getPath : function() {
                            var path = this.model.getId();
                            path = path && path != '' ? path
                                    : this.options.path;
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
                            var that = this;
                            var model = this.model;
                            var changed = false;
                            _.each(schema, function(item, index) {
                                var value = data[index];
                                if (item.getValueFromLabel) {
                                    value = item.getValueFromLabel(value,
                                            model, that);
                                }
                                if (value !== undefined) {
                                    changed |= Utils.updateObject(attributes,
                                            item.property, value);
                                }
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