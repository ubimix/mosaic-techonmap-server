define([ 'Backbone', './Validator' ], function(Backbone, Validator) {

    var Resource = Backbone.Model.extend({
        urlRoot : '/api/resources/',

        defaults : {
            properties : {
                description : '',
                name : '',
                address : '',
                postcode : '',
                city : '',
                creationyear : '',
                url : '',
                linkedin : '',
                id : '',
                category : ''
            },
            sys : {
                path : ''
            },
            type : 'Feature',
            geometry : {
                type : 'Point',
                coordinates : [ 0, 0 ]
            }
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

        getUpdated : function() {
            return this.getSys().updated || {};
        },
        getCreated : function() {
            return this.getSys().created || {};
        },

        getVersionId : function() {
            return this.getUpdated().versionId;
        },

        updateAndSave : function(properties, geometry, callback) {
            var copy = this.getCopy();
            this.set('properties', properties);
            this.set('geometry', geometry);

            this.save(null, {
                error : function(model, xhr) {
                    // restore the model
                    this.set('properties', copy.get('properties'));
                    this.set('geometry', copy.get('geometry'));
                    throw new Error('La resource n\'a pu être mise à jour correctement.');
                },
                success : function(model) {
                    // FIXME
                    Validator.clearInstance();
                    callback(model);

                }
            });
        },

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

    return Resource;
});