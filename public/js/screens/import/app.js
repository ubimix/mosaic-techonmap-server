define([ './view' ], function(ImportView) {
    return {
        run : function(viewManager, options) {
            var view = new ImportView({
                workspace : options.workspace
            });
            viewManager.show(view);
        }
    };
});