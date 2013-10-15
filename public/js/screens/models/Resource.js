define([ 'Backbone', './Validator' ], function(Backbone, Validator) {

    var Resource = Backbone.Model.extend({
        urlRoot : '/api/resources/',

        defaults : {
            properties : {
                description : 'Description...',
                name : '',
                address : '',
                postcode : '',
                city : '',
                tags: ['tag1','tag2','tag3'],
                creationyear : '',
                url : '',
                linkedin : '',
                id : '',
                category : 'entreprise'
            },
            sys : {
                path : ''
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
            var copy = JSON.parse(JSON.stringify(this.attributes));
            return new Resource(copy);
        },

        getPath : function() {
            return this.getSys().path;
        },

        getTitle : function() {
            var title = this.getProperties().name;
            if (!title)
                title = 'Nouvelle entité';
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
            return Resource.categoryLabels[category] || category;
        },

        getId : function() {
            return this.getProperties().id;
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
            return this.getSys().updated || {};
        },
        getCreated : function() {
            return this.getSys().created || {};
        },

        getVersionId : function() {
            return this.getUpdated().versionId;
        },

        buildPermalink : function() {
            //TODO mv to config
            return 'http://techonmap.fr/#' + this.getId();  
        },
        
        updateAndSave : function(newModel, callback) {
            var copy = this.getCopy();
            this.set('properties', newModel.getProperties());
            this.set('geometry', newModel.getGeometry());
            var that = this;
            this.save(null, {
                error : function(model, xhr) {
                    // restore the model
                    that.set('properties', copy.get('properties'));
                    that.set('geometry', copy.get('geometry'));
                    throw new Error('La resource n\'a pu être mise à jour correctement.');
                },
                success : function(model) {
                    // FIXME
                    Validator.clearInstance();
                    callback(model);

                }
            });
        },

        deleteSysAttributes : function() {
            delete this.attributes._id;
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