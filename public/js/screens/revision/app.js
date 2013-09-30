define([ 'Backbone', '../models/Resource', './view' ], function(Backbone, ResourceModel, RevisionView) {
    return {
        run : function(viewManager, options) {
            var revisions = new Backbone.Collection();
            revisions.model = ResourceModel;
            revisions.url = '/api/resources/' + options.path + '/history/' + options.version;

            revisions.fetch({
                success : function(collection, object) {
                    // TODO : note that the console points to an object which is
                    // introspected when expanding it
                    var view = new RevisionView({
                        model : collection.at(0),
                        workspace : options.workspace
                    });
                    viewManager.show(view);
                }
            });

        }
    };
});