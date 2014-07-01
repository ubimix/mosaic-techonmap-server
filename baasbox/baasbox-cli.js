module.exports = BaasBoxCli;

var Q = require('q');
var Restler = require('restler');
var _ = require('underscore');
var Fs = require('fs');

// see also: https://github.com/troupe/restler-q/blob/master/lib/restler-q.js
// TODO: create namespaces: api.documents, api.users, api...
// TODO : externalize restler calls (see elasticsearch-js/client_action.js)
//check why not all entries are present in the db when imported from the djk folder
//TODO : restler error handling : complete / success / fail

function BaasBoxCli(config) {

    this.config = config || {};

    var self = this;

    if (!config.hasOwnProperty('log')) {
        this.config.log = 'warning';
    }

    if (!config.hosts && !config.host) {
        this.config.host = 'http://localhost:9000';
    }

    function createHeaders(params) {
        return _.extend({
            'User-Agent' : 'restler',
            'X-BB-SESSION' : self.session,
            'X-BAASBOX-APPCODE' : config.appcode
        }, params);
    }

    this.login = function() {
        var defer = Q.defer();
        Restler.post(config.host + '/login', {
            data : config
        }).on('complete', function(body) {
            console.log(body)
            var session = body.data['X-BB-SESSION'];
            var roles = body.data.user.roles;
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
        Restler.get(config.host + '/document/' + collection, {
            headers : createHeaders()
        }).on('complete', function(data) {
            defer.resolve(data);
        });
        return defer.promise;
    }

    this.storeDocument = function(collection, jsonObject) {
        var defer = Q.defer();
        Restler.post(config.host + '/document/' + collection, {
            headers : createHeaders({
                'Content-Type' : 'application/json'
            }),
            data : JSON.stringify(jsonObject)
        }).on('complete', function(data) {
            defer.resolve(data);
        });
        return defer.promise;
    }
    
    this.getDocument = function(collection, documentId) {
        var defer = Q.defer();
        Restler.get(config.host + '/document/' + collection+'/'+documentId, {
            headers : createHeaders()
        }).on('complete', function(data) {
            defer.resolve(data);
        });
        return defer.promise;
        
    }

    this.uploadFile = function(file, mimeType) {

        Fs.stat(file, function(err, stats) {
            Restler.post(self.config.host + '/file', {
                multipart : true,
                headers : createHeaders(),
                data : {
                    'filename' : Restler.file(file, null, stats.size, null, mimeType)
                }
            }).on('complete', function(data) {
                console.log(data);
            });
        });
    }

}
