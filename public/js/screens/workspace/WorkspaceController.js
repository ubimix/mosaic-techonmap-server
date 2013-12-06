define([ '../../models/ResourceCollection', '../../models/Validator',
        './WorkspaceView' ],

function(ResourceCollection, Validator, MainView) {

    return {
        run : function(viewManager, options) {
            function showError(error) {
                var view = new MainView({
                    error : error,
                    workspace : options.workspace
                });
                viewManager.show(view);
            }
            var coll = new ResourceCollection();

            var validator = Validator.getInstance();
            validator.onReady(function() {
                coll.fetch({
                    success : function(coll) {
                        coll
                                .setSort('attributes.sys.updated.timestamp',
                                        'desc');
                        // coll.pager();
                        var view = new MainView({
                            collection : coll,
                            workspace : options.workspace,
                            sort : options.sort
                        });
                        viewManager.show(view);
                    },
                    error : showError
                });
            });

        }
    };
});
