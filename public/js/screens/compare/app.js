define([ 'Backbone', '../commons/LinkController', '../models/Resource',
        './view' ],

function(Backbone, LinkController, ResourceModel, CompareView) {
    return {
        run : function(viewManager, options) {
            var linkController = LinkController.getInstance();
            var revisions1 = new Backbone.Collection([], {
                model : ResourceModel,
                // FIXME: replace it by a direct API call
                url : linkController.toHistoryApiLink(options.path, options.v1)
            });

            var revisions2 = new Backbone.Collection([], {
                model : ResourceModel,
                // FIXME: replace it by a direct API call
                url : linkController.toHistoryApiLink(options.path, options.v2)
            });

            revisions1.fetch({
                success : function(r1) {
                    var revision1 = r1.at(0);
                    revision1.id = options.path;
                    revisions2.fetch({
                        success : function(r2) {
                            var revision2 = r2.at(0);
                            revision2.id = options.path;

                            var view = new CompareView({
                                revision1 : revision1,
                                revision2 : revision2,
                                workspace : options.workspace
                            });
                            viewManager.show(view);

                        }
                    });
                }
            });
        }
    };
});