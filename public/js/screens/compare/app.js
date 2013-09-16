define([ './view' ], function(CompareView) {
    return {
        run : function(viewManager, options) {
            $.get('/api/resources/' + options.path + '/history/' + options.v1, function(version1) {

                $.get('/api/resources/' + options.path + '/history/' + options.v2, function(version2) {
                    var view = new CompareView({
                        v1 : version1,
                        v2 : version2,
                        path : options.path,
                        workspace : options.workspace
                    });
                    viewManager.show(view);
                }, 'json');

            }, 'json');
        }
    };
});