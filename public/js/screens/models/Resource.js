define([ 'Backbone' ], function(Backbone) {

    var Resource = Backbone.Model.extend({
        urlRoot : '/api/resources/',

        getCopy : function() {
            var copy = JSON.parse(JSON.stringify(this.attributes));
            return new Resource(copy);
        },

        getPath : function() {
            return this.get('sys').path;
        },

        getTitle : function() {
            return this.get('properties').name;
        },
        
        getVersionId : function() {
            console.log(this);
            //return this.get('sys').updated.versionId;
            return '';
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
                    callback(model);

                }
            });
        }

    });

    return Resource;
});