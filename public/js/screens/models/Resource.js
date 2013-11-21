define(
        [ 'Backbone', './Validator' ],
        function(Backbone, Validator) {

            var Resource = Backbone.Model
                    .extend({
                        idAttribute : 'id',

                        urlRoot : '/api/resources/',

                        url : function() {
                            var id = this.get('id');
                            var url = this.urlRoot + id;
                            return url;
                        },

                        defaults : {
                            properties : {
                                description : 'Description...',
                                name : '',
                                address : '',
                                postcode : '',
                                city : '',
                                tags : [ 'tag1', 'tag2', 'tag3' ],
                                creationyear : '',
                                url : '',
                                linkedin : '',
                                id : '',
                                category : 'entreprise'
                            },
                            sys : {
                                id : ''
                            },
                            type : 'Feature',
                            geometry : {
                                type : 'Point',
                                coordinates : [ 2.34, 48.85 ]
                            }
                        },

                        initialize : function() {
                        },

                        getCopy : function() {
                            var copy = JSON.parse(JSON
                                    .stringify(this.attributes));
                            return new Resource(copy);
                        },

                        getPath : function() {
                            return this.getId();
                        },

                        getTitle : function() {
                            var title = this.getProperties().name;
                            if (!title)
                                title = '';
                            return title;
                        },

                        getDescription : function() {
                            return this.getProperties().description;
                        },

                        getCategory : function() {
                            return this.getProperties().category || '';
                        },

                        getCategoryLabel : function() {
                            var category = this.getCategory();
                            return Resource.categoryLabels[category]
                                    || category;
                        },

                        getId : function() {
                            var id = this.getProperties().id;
                            if (id == '')
                                id = null;
                            return id;
                        },

                        isNew : function() {
                            var id = this.getId();
                            return !id || id == ''
                        },

                        getProperties : function() {
                            return this.get('properties');
                        },

                        getSys : function() {
                            return this.get('sys');
                        },

                        getGeometry : function() {
                            return this.get('geometry');
                        },

                        getUpdated : function() {
                            console.log('updated', this.getSys().updated);
                            return this.getSys().updated || {};
                        },
                        getCreated : function() {
                            return this.getSys().created || {};
                        },

                        getVersionId : function() {
                            return this.getUpdated().versionId;
                        },

                        getVersionTimestamp : function() {
                            return this.getUpdated().timestamp;
                        },

                        buildPermalink : function() {
                            // TODO mv to config
                            return 'http://techonmap.fr/#' + this.getId();
                        },

                        updateAndSave : function(newModel, callback) {
                            var copy = this.getCopy();
                            this.set('properties', newModel.getProperties());
                            this.set('geometry', newModel.getGeometry());
                            var that = this;
                            this
                                    .save(
                                            null,
                                            {
                                                error : function(model, xhr) {
                                                    // restore the model
                                                    that.set('properties', copy
                                                            .get('properties'));
                                                    that.set('geometry', copy
                                                            .get('geometry'));
                                                    throw new Error(
                                                            'La resource n\'a pu être mise à jour correctement.');
                                                },
                                                success : function(model) {
                                                    // FIXME
                                                    Validator.clearInstance();
                                                    callback(model);

                                                }
                                            });
                        },

                        deleteSysAttributes : function() {
                            delete this.attributes.id;
                            delete this.attributes.sys;
                            delete this.attributes.properties.oldid;
                            delete this.attributes.properties.origin;
                        }

                    });

            // TODO: turn to static function

            Resource.categoryLabels = {
                'entreprise' : 'Entreprise',
                'third-place' : 'Tiers-lieu',
                'incubator' : 'Incubateur',
                'investor' : 'Investisseur',
                'community' : 'Communauté',
                'prestataire' : 'Prestataire',
                'school' : 'École',
                'public-actor' : 'Acteur public'
            };

            Resource.mapCategory = function(label) {
                if (!label)
                    return '';
                var category = label;
                _.each(Resource.categoryLabels, function(value, key) {
                    if ((value.toLowerCase() == label.toLowerCase())) {
                        category = key;
                    }
                });

                return category;
            }

            return Resource;
        });