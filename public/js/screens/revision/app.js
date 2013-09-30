define([ 'Backbone', '../models/Resource', './view' ], function(Backbone, ResourceModel, RevisionView) {
    return {
        run : function(viewManager, options) {
            var revisions = new Backbone.Collection([], {
                model : ResourceModel,
                url : '/api/resources/' + options.path + '/history/' + options.version
            });
            

            revisions.fetch({
                success : function(collection, object) {
                    // TODO : note that the console points to an object which is
                    // introspected when expanding it
                    var revision = collection.at(0);
                    // FIXME: why is this needed ?
                    revision.id = options.path;
                    var view = new RevisionView({
                        model : revision,
                        workspace : options.workspace
                    });
                    viewManager.show(view);
                }
            });

        }
    };
});