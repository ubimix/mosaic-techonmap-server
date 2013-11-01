define([ '../commons/LinkController', '../models/Resource', './view' ],

function(LinkController, Resource, HistoryView) {
    return {
        run : function(viewManager, options) {

            var linkController = LinkController.getInstance();
            var history = new Backbone.Model();
            history.url = linkController.getApiVersionLink(options.path);

            function showError(error) {
                var view = new MainView({
                    error : err,
                    workspace : options.workspace
                });
                viewManager.show(view);
            }

            history.fetch({
                success : function(history) {
                    var resource = new Resource({
                        id : options.path
                    });
                    resource.fetch({
                        success : function(resource) {
                            var view = new HistoryView({
                                model : resource,
                                history : history,
                                workspace : options.workspace
                            });
                            viewManager.show(view);
                        },
                        error : showError
                    });

                },
                error : showError
            });

            // why is jQuery available while not in the defines ?
            // because
            // Backbone depends on it ?
            // $.get('/api/resources/' + options.path + '/history',

        }
    };
});