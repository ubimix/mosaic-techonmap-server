define([ './view' ], function(HistoryView) {
    return {
        run : function(viewManager, options) {
            // why is jQuery available while not in the defines ? because
            // Backbone depends on it ?
            $.get('/api/resources/' + options.path + '/history/' + options.version, function(data) {
                var view = new HistoryView({
                    resource : data,
                    version : options.version,
                    path : options.path,
                    workspace : options.workspace
                });
                viewManager.show(view);
            }, 'json');

        }
    };
});