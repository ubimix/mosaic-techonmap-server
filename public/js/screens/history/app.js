define([ '../models/Resource', './view' ], function(Resource, HistoryView) {
    return {
        run : function(viewManager, options) {

            var history = new Backbone.Model();
            history.url = '/api/resources/' + options.path + '/history';

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
                                resource : resource,
                                history : history,
                                path : options.path,
                                workspace : options.workspace
                            });
                            viewManager.show(view);
                        },
                        error : showError
                    });

                },
                error : showError
            });

            // why is jQuery available while not in the defines ? because
            // Backbone depends on it ?
            // $.get('/api/resources/' + options.path + '/history',
            // function(data) {
            // console.log(data);
            // var view = new HistoryView({
            // name : resourceName,
            // history : history,
            // path : options.path,
            // workspace : options.workspace
            // });
            // viewManager.show(view);
            // }, 'json');

        }
    };
});