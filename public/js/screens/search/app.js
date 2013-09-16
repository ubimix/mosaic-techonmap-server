define([ './view' ], function(SearchView) {
    return {
        run : function(viewManager, options) {
            var view = new SearchView(options);
            viewManager.show(view);
        }
    };
});