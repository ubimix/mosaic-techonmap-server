define([ 'Backbone' ], function(Backbone) {

    var Resource = Backbone.Model.extend({
        urlRoot : '/api/resources',
        defaults : {
            type : 'Feature',
            geometry : {
                type : 'Point',
                coordinates : []
            },
            properties : {
                name : '',
                description : '',
                address : '',
                postcode : '',
                city : '',
                creationyear : '',
                url : '',
                twitter : '',
                linkedin : '',
                viadeo : '',
                id : '',
                tags : [],
                category : ''
            }
        }

    });

    return Resource;
});