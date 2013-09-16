define([ '../collections/ResourceCollection', './views/main' ], function(ResourceCollection, MainView) {

    return {
        run : function(viewManager, options) {
            var coll = new ResourceCollection();
            coll.fetch({
                success : function(coll) {
                    var view = new MainView({
                        collection : coll,
                        workspace : options.workspace,
                        sort : options.sort
                    });
                    viewManager.show(view);
                },
                error: function(err) {
                    var view = new MainView({
                        error : err,
                        workspace : options.workspace
                    });
                    viewManager.show(view);
                }
            });
        }
    };
});
