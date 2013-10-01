define([ 'Backbone','./Validator' ], function(Backbone, Validator) {

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
                title = 'New Entity';
            return title;
        },

        getDescription : function() {
            return this.getProperties().description;
        },

        getCategory : function() {
            return this.getProperties().category || '';
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

        updateAndSave : function(properties, callback) {
            var copy = this.getCopy();
            this.set('properties', properties);

            this.save(null, {
                error : function(model, xhr) {
                    console.log('error....');
                    // restore the model
                    this.set('properties', copy.get('properties'));
                    throw new Error('The resource could not be saved successfully.');
                },
                success : function(model) {
                    //FIXME
                    Validator.clearInstance();
                    callback(model);

                }
            });
        }

    });

    return Resource;
});