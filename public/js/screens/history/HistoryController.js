define([ '../../models/LinkController', '../../models/Resource', './HistoryView' ],

function(LinkController, Resource, HistoryView) {
    return {
        run : function(viewManager, options) {

            var linkController = LinkController.getInstance();
            var history = new Backbone.Model();
            history.url = linkController.getLink('/api/resources/'
                    + options.path + '/history');

            function showError(object, error) {
                console.log(object, error);
            }


	    console.log('history.url:', history.url);
	    //history.url = '/api/resources/ubimix/history';
            history.fetch({
                success : function(history) {
		    console.log('success', options.path);
                    var resource = new Resource({
                        id : options.path
                    });
                    resource.fetch({
                        success : function(resource) {
                            var view = new HistoryView({
                                model : resource,
                                history : history,
                                workspace : options.workspace
                            });
                            viewManager.show(view);
                        },
                        error : showError
                    });

                },
                error : showError
            });
            
            // why is jQuery available while not in the defines ?
            // because
            // Backbone depends on it ?
            // $.get('/api/resources/' + options.path + '/history',

        }
    };
});
