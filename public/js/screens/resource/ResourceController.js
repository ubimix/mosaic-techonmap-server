define([ '../../models/LinkController', '../../models/Resource', './ResourceView' ],

function(LinkController, Resource, ResourceView) {
    var linkController = LinkController.getInstance();

    function showResource(viewManager, model, options) {
        var path = options.path;
        var view = new ResourceView({
            model : model,
            path : path,
            workspace : options.workspace
        });
        viewManager.show(view);
    }
    return {
        run : function(viewManager, options) {
            var path = options.path;
            var create = options.create;
            var resource = new Resource({
                id : path
            });
            
            resource.fetch({
                // TODO: handle errors when no resource found with given id
                success : function(model, object) {
                    console.log(resource)
                    showResource(viewManager, resource, options);

                    // $.get('/api/resources/' + options.path + '/binaries',
                    // function(data) {
                    // resource.setBinaries(data);
                    //                        
                    // $.get('/api/resources/' + options.path + '/relations',
                    // function(relations) {
                    // console.log(data);
                    // resource.setAllRelations(relations.relations);
                    // // TODO: why both model + object are returned ? where is
                    // // it documented ?
                    //                                
                    // });
                    //                            
                    // });

                },
                error : function(err) {
                    resource.set('id', null);
                    showResource(viewManager, resource, options);
                }
            });
        }
    };
});