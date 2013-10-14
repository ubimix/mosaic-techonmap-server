define(function(require) {
    var Backbone = require('Backbone');
    var viewManager = require('./viewManager');
    var Router = Backbone.Router
            .extend({
                routes : {
                    // '' : 'workspaceScreen',
                    'login' : 'loginScreen',
                    'search' : 'searchScreen',
                    ':workspace/search' : 'searchScreen',
                    ':workspace/import' : 'importScreen',
                    ':workspace' : 'workspaceScreen',
                    ':workspace/' : 'workspaceScreen',
                    ':workspace/sort/:sort' : 'workspaceScreen',
                    ':workspace/*path/history/compare/:version1/with/:version2' : 'compareScreen',
                    ':workspace/*path/history/:version' : 'revisionScreen',
                    ':workspace/*path/history' : 'historyScreen',
                    ':workspace/*path' : 'resourceScreen'
                },
                loginScreen : function() {
                    require('./../screens/login/app').run(viewManager, {});
                },
                searchScreen : function(workspace) {
                    require('./../screens/search/app').run(viewManager, {
                        workspace : workspace
                    });
                },
                importScreen : function(workspace) {
                    require('./../screens/import/app').run(viewManager, {
                        workspace : workspace
                    });
                },
                workspaceScreen : function(workspace, sort) {
                    require('./../screens/workspace/app').run(viewManager, {
                        workspace : workspace,
                        sort : sort
                    });
                },
                compareScreen : function(workspace, path, v1, v2) {
                    require('./../screens/compare/app').run(viewManager, {
                        workspace : workspace,
                        path : path,
                        v1 : v1,
                        v2 : v2
                    });
                },
                historyScreen : function(workspace, path) {
                    require('./../screens/history/app').run(viewManager, {
                        workspace : workspace,
                        path : path
                    });
                },
                resourceScreen : function(workspace, path) {
                    require('./../screens/resource/app').run(viewManager, {
                        workspace : workspace,
                        path : path
                    });
                },
                revisionScreen : function(workspace, path, version) {
                    require('./../screens/revision/app').run(viewManager, {
                        workspace : workspace,
                        path : path,
                        version : version
                    });
                }

            });

    return Router;
});