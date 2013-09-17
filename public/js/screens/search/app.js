define([ './view', 'BootstrapTypeahead'], function(SearchView, BootstrapTypeahead) {
    return {
        run : function(viewManager, options) {
            var view = new SearchView(options);
            viewManager.show(view);
        }
    };
});