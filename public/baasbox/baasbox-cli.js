module.exports = BaasBoxCli;

var Q = require('q');
var Request = require('superagent');
var _ = require('underscore');

// see also: https://github.com/troupe/restler-q/blob/master/lib/restler-q.js
// TODO: create namespaces: api.documents, api.users, api...
// TODO : externalize restler calls (see elasticsearch-js/client_action.js)
// check why not all entries are present in the db when imported from the djk
// folder
// TODO : restler error handling : complete / success / fail

function BaasBoxCli(config) {

    this.config = config || {};

    var self = this;

    if (!config.hasOwnProperty('log')) {
        this.config.log = 'warning';
    }

    if (!config.hosts && !config.host) {
        this.config.host = 'http://localhost:9000';
    }

    this.login = function() {
        var defer = Q.defer();
        Request.post(config.host + '/login').send(config).set('Content-Type', 'application/x-www-form-urlencoded').end(
        // agent().post(config.host + '/login').end(
        function(error, res) {
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

    this.listDocuments = function(collection) {
        var defer = Q.defer();
        var url = config.host + '/document/' + collection;
        // Restler.get(url, {
        // headers : createHeaders()
        // }).on('complete', function(data) {
        // defer.resolve(data);
        // });

        Request.get(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(function(error, res) {
            if (error)
                defer.reject(new Error(error));
            defer.resolve(res.body.data);
        });

        return defer.promise;
    }

    this.storeDocument = function(collection, jsonObject) {
        var defer = Q.defer();
        var url = config.host + '/document/' + collection;
        Request.post(url).send(jsonObject).set('Content-Type', 'application/json').set('X-BB-SESSION', self.session).set(
                'X-BAASBOX-APPCODE', config.appcode).end(function(error, res) {
            if (error)
                defer.reject(new Error(error));
            defer.resolve(res.body.data);
        });

        // Restler.post(, {
        // headers : createHeaders({
        // 'Content-Type' : 'application/json'
        // }),
        // data : JSON.stringify(jsonObject)
        // }).on('complete', function(data) {
        // defer.resolve(data);
        // });
        return defer.promise;
    }

    this.loadResource = function(collection, documentId) {
        var defer = Q.defer();
        var url = config.host + '/document/' + collection + '/' + documentId;

        Request.get(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(function(error, res) {
            if (error)
                defer.reject(new Error(error));
            defer.resolve(res.body.data);
        });

        return defer.promise;

    }

    this.uploadFile = function(file, mimeType) {

        // Fs.stat(file, function(err, stats) {
        // Restler.post(self.config.host + '/file', {
        // multipart : true,
        // headers : createHeaders(),
        // data : {
        // 'filename' : Restler.file(file, null, stats.size, null, mimeType)
        // }
        // }).on('complete', function(data) {
        // console.log(data);
        // });
        // });
    }

    this.queryCollection = function(collection, params) {
        var defer = Q.defer();
        var url = config.host + '/document/' + collection + '?';
        _.each(params, function(value, key) {
            if (key != undefined) {
                url += '&' + key + '=' + value;
            }
        });
        if (params.recordsPerPage === undefined) {
            url += '&recordsPerPage=100';
        }
        // console.log(url);

        Request.get(url).set('X-BB-SESSION', self.session).set('X-BAASBOX-APPCODE', config.appcode).end(function(error, res) {
            if (error)
                defer.reject(new Error(error));
            defer.resolve(res.body.data);
        });

        return defer.promise;
    }

}
