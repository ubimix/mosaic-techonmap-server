define(
        [ '../../commons/TemplateView', 'Underscore', 'Handsontable', 'Leaflet', '../../models/Resource', 'utils',
                'text!./ResourceContentView.html', 'BootstrapCarousel' ],

        function(TemplateView, _, Handsontable, Leaflet, ResourceModel, Utils, ResourceContentViewTemplate) {

            var ResourceTableView = TemplateView
                    .extend({
                        template : _.template(ResourceContentViewTemplate),

                        initialize : function(options) {
                            this.readOnly = this.options.readOnly === true;
                        },

                        renderRelationsEdit : function(elm) {
                            var relations = this.model.getRelations();
                            var relationsValue = '';

                            _.each(relations, function(relation, index) {
                                relationsValue += relation.id + '\n';
                            });

                            this.relationsEditor = $('<textarea rows="5" cols="40" id="new-relations">' + relationsValue
                                    + '</textarea>');
                            elm.append(this.relationsEditor);
                        },

                        isReadonly : function() {
                            return this.options.readOnly === true;
                        },

                        renderDescription : function(elm) {
                            this.contentEditor = Utils.newCodeMirror(elm.get(0), {
                                lineNumbers : false
                            }, this.isReadonly(), this.getDescription());
                        },

                        renderAllRelations : function(elm) {
                            var relations = this.model.getAllRelations();
                            var html = '<ul>'
                            _.each(relations, function(rel) {
                                html += '<li><a href="/workspace/' + rel.id + '">' + rel.id + '</a></li>';
                            })
                            html += '</ul>'
                            elm.html(html)
                        },

                        renderImages : function(elm) {
                            if (!this.model.binaries)
                                return;
                            var files = this.model.binaries.binaries;
                            var that = this;
                            var images = [];
                            _.each(files, function(file) {
                                var str = file.toLowerCase();
                                if (Utils.hasImageExtension(str)) {
                                    images.push(file);
                                }
                            });

                            if (images.length == 1) {
                                elm.html('<img src="' + that.model.url() + '/' + images[0] + '"/>');
                            } else if (images.length > 1) {

                                // carousel
                                var html = '<div id="carousel-example-generic" class="carousel slide" data-inverval="0">';
                                html += '<ol class="carousel-indicators">';
                                _.each(images, function(image, index) {
                                    var active = "";
                                    if (index == 0)
                                        active = "active";
                                    html += '<li data-target="#carousel-example-generic" data-slide-to="' + index + '" class="'
                                            + active + '"></li>';
                                });
                                html += '</ol>';
                                html += '<div class="carousel-inner">';
                                _.each(images, function(image, index) {
                                    if (index == 0)
                                        html += '<div class="item active">';
                                    else
                                        html += '<div class="item">';
                                    html += '<img alt="First slide" src="' + that.model.url() + '/' + images[index] + '">';
                                    html += '</div>';
                                });

                                html += '</div>';
                                html += '<a class="left carousel-control" data-target="#carousel-example-generic" role="button" data-slide="prev">';
                                html += '<span class="glyphicon glyphicon-chevron-left"></span>';
                                html += '</a>';
                                html += '<a class="right carousel-control" data-target="#carousel-example-generic" role="button" data-slide="next">';
                                html += '<span class="glyphicon glyphicon-chevron-right"></span>';
                                html += '</a>';
                                html += '</div>';
                                elm.html(html);

                            }

                        },

                        renderBinaries : function(elm) {
                            if (!this.model.binaries)
                                return;
                            var files = this.model.binaries.binaries;
                            var that = this;
                            var html = '<ul>'
                            _.each(files, function(file) {
                                if (file != 'index.md')
                                    html += '<li><a href="' + that.model.url() + '/' + file + '">' + file + '</li>';
                            })
                            html += '</ul>'
                            elm.html(html);

                        },

                        getPath : function() {
                            var path = this.model.getId();
                            path = path && path != '' ? path : this.options.path;
                            return path;
                        },

                        getDescription : function() {
                            //return this._getProperties().description || '';
                            //return this._getProperties().content || '';
                            return this._getContent();
                        },

                        getFormattedProperties : function() {
                            // FIXME
                            var properties = this.model.attributes;
                            var yaml = Utils.toStructuredContent(properties).yaml;
                            return yaml;
                        },

                        getFormattedContent : function() {
                            //var properties = this._getProperties();
                            //return properties.content.trim();
                            return this._getContent().trim();
                        },

                        _getAttributes : function() {
                            return this.model.attributes;
                        },
                        
                        _getContent : function() {
                          return this.model.attributes.content || {};  
                        },

                        _getProperties : function() {
                            var properties = this.model.attributes.properties || {};
                            return properties;
                        },

                        updateModel : function() {
                            var copy = this.model.getCopy();
                            var attributes = copy.attributes;
                            var changed = false;

                            var content = this.contentEditor.getValue();
                            var relations = this.relationsEditor.val();
                            relations = relations.split('\n');
                            var newRelations = [];
                            _.each(relations, function(relation) {
                                if (relation.trim().length > 0)
                                    newRelations.push({
                                        id : relation
                                    });
                            });
                            changed |= Utils.updateObject(attributes, 'properties.relations', newRelations);

                            changed |= Utils.updateObject(attributes, 'content', content);
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
