(function(define) {
    "use strict";
    define('BaasBoxCli', [ 'When', 'Superagent', 'Underscore' ], module);
    function module(P, Request, _) {
        // see also:
        // https://github.com/troupe/restler-q/blob/master/lib/restler-q.js
        // TODO: create namespaces: api.documents, api.users, api...
        // TODO : externalize restler calls (see
        // elasticsearch-js/client_action.js)
        // check why not all entries are present in the db when imported from
        // the djk
        // folder
        // TODO : restler error handling : complete / success / fail

        function BaasBoxCli(config) {

            this.config = config || {};

            if (!config.hasOwnProperty('log')) {
                this.config.log = 'warning';
            }

            if (!config.hosts && !config.host) {
                this.config.host = 'http://localhost:9000';
            }

            var self = this;

            //this.login = function(params) {
            this.login = function() {
                var defer = P.defer();
//                params = _.defaults({}, params, { appcode: config.appcode });
                //params = _.defaults({}, params, config);
                Request.post(config.host + '/login').send(config).type('form').end(function(error, res) {
                    if (error)
                        defer.reject(new Error(error));
                    var session = res.body.data['X-BB-SESSION'];
                    var roles = res.body.data.user.roles;
                    self.session = session;
                    defer.resolve({
                        session : session,
                        roles : roles
                    });
                });
                return defer.promise;
            }

            this.createCollection = function(collection, jsonObject) {
                var defer = P.defer();
                var url = config.host + '/admin/collection/' + collection;
                Request.post(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            defer.resolve(res.body);
                        });
                return defer.promise;
            }

            this.queryCollection = function(collection, params) {
                var defer = P.defer();
                var url = config.host + '/document/' + collection + '?';
                _.each(params, function(value, key) {
                    if (key != undefined) {
                        url += '&' + key + '=' + value;
                    }
                });
                if (params.recordsPerPage === undefined) {
                    url += '&recordsPerPage=100';
                }

                url += '&orderBy=properties.label';
                console.log(url);

                Request.get(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            defer.resolve(res.body.data);
                        });

                return defer.promise;
            }

            this.deleteCollection = function(collection) {
                var defer = P.defer();
                var url = config.host + '/admin/collection/' + collection;
                Request.del(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            defer.resolve(res.body);
                        });
                return defer.promise;
            }

            this.listResources = function(collection) {
                var defer = P.defer();
                var url = config.host + '/document/' + collection;

                Request.get(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            defer.resolve(res.body.data);
                        });

                return defer.promise;
            }

            this.getResource = function(collection, documentId) {
                var defer = P.defer();
                var url = config.host + '/document/' + collection + '/' + documentId;

                Request.get(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            defer.resolve(res.body.data);
                        });

                return defer.promise;

            }

            this.storeResource = function(collection, jsonObject) {
                var defer = P.defer();
                var url = config.host + '/document/' + collection;
                Request.post(url).send(jsonObject).set('Content-Type', 'application/json').set('X-BB-SESSION', self.session).set(
                        'X-BAASBOX-APPCODE', config.appcode).end(function(error, res) {
                    if (error)
                        defer.reject(new Error(error));
                    defer.resolve(res.body);
                });
                return defer.promise;
            }

            this.updateResource = function(collection, resourceId, jsonObject) {
                var defer = P.defer();
                var url = config.host + '/document/' + collection + '/' + resourceId;
                console.log('updating resource...', resourceId, jsonObject);
                Request.put(url).send(jsonObject).set('Content-Type', 'application/json').set('X-BB-SESSION', self.session).set(
                        'X-BAASBOX-APPCODE', config.appcode).end(function(error, res) {
                    console.log(res);
                    if (error)
                        defer.reject(new Error(error));
                    defer.resolve(res.body);
                });
                return defer.promise;
            }

            this.updateResourceField = function(collectionName, resourceId, fieldId, fieldValue) {
                var url = self.config.host + '/document/' + collectionName + '/' + resourceId + '/.' + fieldId;
                var defer = P.defer();
                var jsonObject = {
                    data : fieldValue
                };
                Request.put(url).send(jsonObject).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            console.log(res.body)
                            defer.resolve(res.body);
                        });

                return defer.promise;
            }

            this.getFileMetadata = function(fileId) {
                var defer = P.defer();
                var url = config.host + '/file/details/' + fileId;
                Request.get(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            defer.resolve(res.body.data);
                        });
                return defer.promise;
            }

            this.getFilesMetadata = function() {
                var defer = P.defer();
                var url = config.host + '/file/details';
                Request.get(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            defer.resolve(res.body.data);
                        });
                return defer.promise;
            }

            this.uploadFile = function(file) {
                var url = self.config.host + '/file';
                var defer = P.defer();
                Request.post(url).attach('file', file).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode)
                        .end(function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            console.log(res.body)
                            defer.resolve(res.body);
                        });

                return defer.promise;
            }

            this.deleteFile = function(fileId) {
                var defer = P.defer();
                var url = config.host + '/file/' + fileId;
                Request.del(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            defer.resolve(res.body);
                        });
                return defer.promise;
            }
            
            this.getFile = function(fileId) {
                var defer = P.defer();
                var url = config.host + '/file/' + fileId+'?download=true';
                Request.get(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(
                        function(error, res) {
                            if (error)
                                defer.reject(new Error(error));
                            defer.resolve(res);
                        });
                return defer.promise;
            }

        }

        return BaasBoxCli;
    }

})

/* ------------------------------------------ */
(function(context) {
    if (typeof define === "function" && define.amd) {
        return define;
    } else {
        var isCommonJS = typeof exports === 'object';
        return function(name, deps, definition) {
            var args = [];
            for ( var i = 0; i < deps.length; i++) {
                // TODO: toLowerCase: SL hack to be fixed
                var dep = isCommonJS ? require(deps[i].toLowerCase()) : context[deps[i]];
                args.push(dep);
            }
            var result = definition.apply(context, args);
            if (isCommonJS) {
                module.exports = result;
            } else {
                context[name] = result;
            }
        };
    }
}(this));
/* ------------------------------------------ */

