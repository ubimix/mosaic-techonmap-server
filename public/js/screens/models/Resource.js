define([ 'Backbone' ], function(Backbone) {

    var Resource = Backbone.Model.extend({
        //TODO: why do we need to define a urlRoot while there is a 'url' field
        //in the collection
        //http://backbonejs.org/#Model-urlRoot
        urlRoot : '/api/resources/',
        defaults : {
            instanceID : 0,
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
                category : '',
                type : '',
                geometry : {
                    type : '',
                    coordinates : []
                }
            },
            sys : {
                path : '',
                created : {
                    instanceID : 0,
                    timestamp : 0,
                    version : 0
                },
                updated : {
                    instanceID : 0,
                    timestamp : 0,
                    version : 0
                }
            }
        }

    });

    return Resource;
});