define([ '../models/Resource', './view'], function(Resource, ResourceView) {
    return {
        run : function(viewManager, options) {
            var resource = new Resource({
                id : options.path
            });
            
            resource.fetch({
                //TODO: handle errors when no resource found with given id
                success : function(res) {
                    var view = new ResourceView({
                        model : res,
                        path : options.path,
                        workspace : options.workspace
                    });
                    viewManager.show(view);
                }
            });
        }
    };
});