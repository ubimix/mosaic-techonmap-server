define([ 'Backbone', '../models/Resource', './view' ], function(Backbone, ResourceModel, CompareView) {
    return {
        run : function(viewManager, options) {

            var revisions1 = new Backbone.Collection([], {
                model : ResourceModel,
                url : '/api/resources/' + options.path + '/history/' + options.v1
            });

            var revisions2 = new Backbone.Collection([], {
                model : ResourceModel,
                url : '/api/resources/' + options.path + '/history/' + options.v2
            });

            revisions1.fetch({
                success : function(r1) {
                    var revision1 = r1.at(0);
                    revision1.id = options.path;
                    revisions2.fetch({
                        success : function(r2) {
                            var revision2 = r2.at(0);
                            revision2.id = options.path;

                            var view = new CompareView({
                                revision1 : revision1,
                                revision2 : revision2,
                                workspace : options.workspace
                            });
                            viewManager.show(view);

                        }
                    });
                }

            });

            // $.get('/api/resources/' + options.path + '/history/' +
            // options.v1, function(version1) {
            //
            // $.get('/api/resources/' + options.path + '/history/' +
            // options.v2, function(version2) {
            // var view = new CompareView({
            // v1 : version1,
            // v2 : version2,
            // workspace : options.workspace
            // });
            // viewManager.show(view);
            // }, 'json');
            //
            // }, 'json');
        }
    };
});