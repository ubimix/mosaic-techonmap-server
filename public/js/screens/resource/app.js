define([ '../models/Resource', './view' ], function(Resource, ResourceContainerView) {
    return {
        run : function(viewManager, options) {

            var resource = new Resource({
                id : options.path
            });

            if (options.path == 'new') {

                var view = new ResourceContainerView({
                    model : new Resource(),
                    path : options.path,
                    workspace : options.workspace
                });
                
                viewManager.show(view);
                
            } else {

                resource.fetch({
                    // TODO: handle errors when no resource found with given id
                    success : function(model, object) {
                        // TODO: why both model + object are returned ? where is
                        // it
                        // documented ?
                        var view = new ResourceContainerView({
                            model : model,
                            path : options.path,
                            workspace : options.workspace
                        });
                        viewManager.show(view);
                    }
                });
            }
        }
    };
});