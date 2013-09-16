define([ './view' ], function(HistoryView) {
    return {
        run : function(viewManager, options) {
            // why is jQuery available while not in the defines ? because
            // Backbone depends on it ?
            $.get('/api/resources/' + options.path + '/history', function(data) {
                var current = data[0];
                current['version'] = 0;
                var history = data;
                var view = new HistoryView({
                    current : current,
                    history : history,
                    path : options.path,
                    workspace : options.workspace
                });
                viewManager.show(view);
            }, 'json');

        }
    };
});