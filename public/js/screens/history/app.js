define([ './view' ], function(HistoryView) {
    return {
        run : function(viewManager, options) {
            // why is jQuery available while not in the defines ? because
            // Backbone depends on it ?
            $.get('/api/resources/' + options.path + '/history', function(data) {
                var history = data.history;
                var resourceName = data.name;
                var view = new HistoryView({
                    name : resourceName,
                    history : history,
                    path : options.path,
                    workspace : options.workspace
                });
                viewManager.show(view);
            }, 'json');

        }
    };
});