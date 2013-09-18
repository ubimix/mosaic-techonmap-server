define([ '../models/Resource', './view'], function(Resource, ResourceView) {
    return {
        run : function(viewManager, options) {
            var resource = new Resource({
                id : options.path
            });
            resource.fetch({
                // TODO: handle errors when no resource found with given id
                success : function(model, object) {
                    //TODO: why both model + object are returned ? where is it documented ?
                    //console.log('Success a: ', model);
                    //console.log('Success b: ', object);
                    var view = new ResourceView({
                        model : model,
                        path : options.path,
                        workspace : options.workspace
                    });
                    viewManager.show(view);
                }
            });
        }
    };
});