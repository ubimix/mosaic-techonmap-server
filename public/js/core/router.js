define(
        [ 'require', 'Backbone', './viewManager' ],
        function(require, Backbone, ViewManager) {
            function runModule(path, options) {
                options = options || {};
                require([ path ], function(module) {
                    module.run(ViewManager, options);
                })
            }
            var Router = Backbone.Router
                    .extend({
                        routes : {
                            '' : 'mapScreen',
                            '/' : 'mapScreen',
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
                            runModule('./../screens/login/app');
                        },
                        searchScreen : function(workspace) {
                            runModule('./../screens/search/app', {
                                workspace : workspace
                            });
                        },
                        importScreen : function(workspace) {
                            runModule('./../screens/import/app', {
                                workspace : workspace
                            });
                        },
                        workspaceScreen : function(workspace, sort) {
                            runModule('./../screens/workspace/app', {
                                workspace : workspace,
                                sort : sort
                            });
                        },
                        compareScreen : function(workspace, path, v1, v2) {
                            runModule('./../screens/compare/app', {
                                workspace : workspace,
                                path : path,
                                v1 : v1,
                                v2 : v2
                            });
                        },
                        historyScreen : function(workspace, path) {
                            runModule('./../screens/history/app', {
                                path : path
                            });
                        },
                        resourceScreen : function(workspace, path) {
                            runModule('./../screens/resource/app', {
                                workspace : workspace,
                                path : path,
                                create : false
                            });
                        },
                        revisionScreen : function(workspace, path, version) {
                            runModule('./../screens/revision/app', {
                                workspace : workspace,
                                path : path,
                                version : version
                            });
                        },
                        mapScreen : function() {
                            window.location = '../';
                        }
                    });

            return Router;
        });