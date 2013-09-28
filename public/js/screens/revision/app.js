define([ 'Backbone', './view' ], function(Backbone, RevisionView) {
    return {
        run : function(viewManager, options) {
            var revision = new Backbone.Model();
            revision.url = '/api/resources/' + options.path + '/history/' + options.version;

            revision.fetch({
                success : function(model, object) {
                    //FIXME
                    var view = new RevisionView({
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