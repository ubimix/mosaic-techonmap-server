define([ '../../models/LinkController', '../../models/Resource', './view' ],

function(LinkController, Resource, ResourceContainerView) {
    var linkController = LinkController.getInstance();

    function showResource(viewManager, model, options) {
        var path = options.path;
        var view = new ResourceContainerView({
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
                    // TODO: why both model + object are returned ? where is
                    // it documented ?
                    showResource(viewManager, resource, options);
                },
                error : function(err) {
                    resource.set('id', null);
                    showResource(viewManager, resource, options);
                }
            });
        }
    };
});