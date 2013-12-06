define(
        [ 'require', 'Backbone', './AppMainView' ],
        function(require, Backbone, AppMainView) {
            var AppRouter = Backbone.Router
                    .extend({
                        initialize : function(options) {
                            this.mainView = new AppMainView(options);
                            this.mainView.render();
                        },
                        routes : {
                            '' : 'mapScreen',
                            '/' : 'mapScreen',
                            'login' : 'loginScreen',
                            ':workspace/import' : 'importScreen',
                            ':workspace' : 'workspaceScreen',
                            ':workspace/' : 'workspaceScreen',
                            ':workspace/sort/:sort' : 'workspaceScreen',
                            ':workspace/*path/history/compare/:version1/with/:version2' : 'compareScreen',
                            ':workspace/*path/history/:version' : 'revisionScreen',
                            ':workspace/*path/history' : 'historyScreen',
                            ':workspace/*path' : 'resourceScreen'
                        },
                        showScreen : function(path, options) {
                            options = options || {};
                            var that = this;
                            require([ path ], function(module) {
                                module.run(that.mainView, options);
                            })
                        },
                        loginScreen : function() {
                            this.showScreen('./../screens/login/app');
                        },
                        importScreen : function(workspace) {
                            this.showScreen('./../screens/import/app', {
                                workspace : workspace
                            });
                        },
                        workspaceScreen : function(workspace, sort) {
                            this.showScreen('./../screens/workspace/app', {
                                workspace : workspace,
                                sort : sort
                            });
                        },
                        compareScreen : function(workspace, path, v1, v2) {
                            this.showScreen('./../screens/compare/app', {
                                workspace : workspace,
                                path : path,
                                v1 : v1,
                                v2 : v2
                            });
                        },
                        historyScreen : function(workspace, path) {
                            this.showScreen('./../screens/history/app', {
                                path : path
                            });
                        },
                        resourceScreen : function(workspace, path) {
                            this.showScreen('./../screens/resource/app', {
                                workspace : workspace,
                                path : path,
                                create : false
                            });
                        },
                        revisionScreen : function(workspace, path, version) {
                            this.showScreen('./../screens/revision/app', {
                                workspace : workspace,
                                path : path,
                                version : version
                            });
                        },
                        mapScreen : function() {
                            window.location = '../';
                        }
                    });

            return AppRouter;
        });