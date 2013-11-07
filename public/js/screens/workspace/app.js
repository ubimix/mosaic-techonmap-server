define([ '../collections/ResourceCollection', '../models/Validator', './views/main' ],

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
            console.log('validator:before')
            validator.onReady(function() {
                console.log('validator:after')
                coll.fetch({
                    success : function(coll) {
                        coll.setSort('attributes.sys.updated.timestamp', 'desc');
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
