define([ '../collections/ResourceCollection', './views/main' ], function(ResourceCollection, MainView) {

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
            
            var verified = new Backbone.Model();
            verified.url = '/api/validation';
            verified.save = function(timestamp, resourceList) {
                this.timestamp = timestamp;
                this.verified =  resourceList;
                this.post();
            }
            
            verified.fetch({
                success : function(verified) {
                    coll.fetch({
                        success : function(coll) {
                            coll.setSort('attributes.sys.updated.timestamp', 'desc');
                            // coll.pager();
                            var view = new MainView({
                                collection : coll,
                                workspace : options.workspace,
                                sort : options.sort,
                                verified : verified
                            });
                            viewManager.show(view);
                        },
                        error : showError
                    });
                },
                error : showError
            })

//            $.get('/api/validation', function(data) {
//                var timestamp = data.properties.timestamp;
//                var verifiedResources = data.properties.verified;
//
//            }, 'json');

        }
    };
});
