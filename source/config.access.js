var Acl = require('acl');
var Step = require('step');
var config = require('./config');
var Q = require('q');
var _ = require('underscore');

module.exports = function(app) {

    var acl = new Acl(new Acl.memoryBackend());

    function yaml2json(yaml) {
        var str = JSON.stringify(yaml);
        return JSON.parse(str);
    }

    function onError(err) {
        if (err) {
            console.log("ERROR: " + err);
        }
    }
    function nfcall(context, method) {
        var array = _.toArray(arguments);
        array.splice(0, 2);
        return Q.nfapply(_.bind(method, context), array);
    }

    function checkAcl(user, resource, action) {
        return nfcall(acl, acl.isAllowed, user, resource, action);
    }

    function getUserId(req, res) {
        // TODO: the user should be stored in res.locals (?)
        // var user = res.locals.user;
        var user = req.user;
        var userId = user ? user.id : null;
        if (!userId)
            userId = 'Anonymous';
        return userId;
    }

    // Resources: 'resource', 'resource-list', 'validator', 'file'
    // Actions: 'read', 'write', 'delete'
    function getProtectedContext(path, method) {
        var action = 'read';
        switch (method) {
        case 'put':
        case 'post':
            action = 'write';
            break;
        case 'delete':
            action = 'delete';
            break;
        case 'get':
        default:
            action = 'read';
            break;
        }
        var resource = null;
        if (path.match(/^\/api\/resources\/export\/?$/)) {
            if (method == 'get') {
                resource = 'resource-list';
                action = 'read';
            }
        } else if (path.match(/^\/api\/resources\/import\/?$/)) {
            if (method == 'put' || method == 'post') {
                resource = 'resource-list';
                action = 'write';
            }
        } else if (path.match(/^\/api\/resources\/?.*$/)) {
            resource = 'resource';
        } else if (path.match(/^\/api\/typeahead\/?.*$/)) {
            if (method == 'get') {
                resource = 'resource';
                action = 'read';
            }
        } else if (path.match(/^\/api\/validation\/?.*$/)) {
            resource = 'validator';
        } else {
            resource = 'file';
        }
        if (!resource)
            return null;
        return {
            resource : resource,
            action : action
        }
    }

    function requireAuthentication(req, res, next) {
        var userId = getUserId(req, res);
        var path = req.url.split('?')[0];
        var method = req.method.toLowerCase();
        Q()
        //
        .then(
                function() {
                    var context = getProtectedContext(path, method);
                    if (!context) {
                        throw new Error('Access denied');
                    }
                    return checkAcl(userId, context.resource, context.action)
                    //
                    .then(
                            function(allowed) {
                                if (allowed)
                                    return true;
                                if (userId == 'Anonymous')
                                    return false;
                                // Additional access check for logged users
                                return checkAcl('LoggedUser', context.resource,
                                        context.action);
                            });
                })
        // 
        .then(
                function(allowed) {
                    if (!allowed) {
                        res.send('Access denied. User: "' + userId
                                + '". Resource: "' + path + '".', 403);
                    }
                },
                function(error) {
                    res.send('Access denied. User: "' + userId
                            + '". Resource: "' + path + '".', 403);
                })
        //
        .then(next)
        //
        .done();
    }

    var accessRules = yaml2json(config.accessRules);
    return nfcall(acl, acl.allow, accessRules).then(function() {
        var userRoles = yaml2json(config.userRoles);
        return Q.all(_.map(userRoles, function(roles, userId) {
            var roles = roles || [];
            return nfcall(acl, acl.addUserRoles, userId, roles);
        }))
    }).then(function(r) {
        var authFunction = function(req, res, next) {
            console.log('Auth!')
            next(null, null);
        };
        app.all('/api/*', requireAuthentication);
        app.all('/api/auth', authFunction);
        app.all('/api/auth/*', authFunction);
        return r;
    });
}
