define([ 'Backbone', '../commons/LinkController', '../models/Resource',
        './view' ],

function(Backbone, LinkController, ResourceModel, RevisionView) {
    return {
        run : function(viewManager, options) {
            var linkController = LinkController.getInstance();
            var revisions = new Backbone.Collection([], {
                model : ResourceModel,
                url : linkController.toHistoryApiLink(options.path, options.version)
            });
            
            revisions.fetch({
                success : function(collection, object) {
                    // TODO : note that the console points to an object which is
                    // introspected when expanding it
                    var revision = collection.at(0);
                    // FIXME: why is this needed ?
                    revision.id = options.path;
                    console.log('revision', revision);
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