var Acl = require('acl');
var Step = require('step');
var config = require('./config');

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
    var accessRules = yaml2json(config.accessRules);
    acl.allow(accessRules, onError);
    var userRoles = yaml2json(config.userRoles);
    for ( var userId in userRoles) {
        var roles = userRoles[userId] || [];
        acl.addUserRoles(userId, roles, onError);
    }

    // Step(function() {
    // var accessRules = yaml2json(config.accessRules);
    // acl.allow(accessRules, this);
    // }, function(err) {
    // if (err)
    // throw err;
    // var userRoles = yaml2json(config.userRoles);
    // for ( var userId in userRoles) {
    // var roles = userRoles[userId] || [];
    // acl.addUserRoles(userId, roles, this);
    // }
    // }, function onError(err) {
    // if (err) {
    // console.log("ERROR: " + err);
    // }
    // })

    function getUserId(req, res) {
        // TODO: the user should be stored in res.locals (?)
        // var user = res.locals.user;
        var user = req.user;
        var userId = user ? user.id : null;
        if (!userId)
            userId = 'Anonymous';
        return userId;
    }

    function requireAuthentication(req, res, next) {
        var userId = getUserId(req, res);
        var path = req.url.split('?')[0];
        path = path.split('/')[1];
        // path = path.split('/').slice(1, path.length).join('/');
        var method = req.method.toLowerCase();
        // method = method === 'get' ? 'read' : 'write';
        Step(function checkAccess() {
            // console.log("USER: ", userId, userRoles[userId])
            acl.isAllowed(userId, path, method, this);
        }, function(err, allowed) {
            // console.log('Access "' + path + '": ' + err, allowed)
            if (err || !allowed) {
                res.send('Access denied. User: "' + userId + '". Resource: "'
                        + path + '".', 403);
                return;
                // TODO: we should probably send an HTTP UNAUTHORIZED error
                // throw new Error();
            } else {
                next();
            }
        })
    }
    app.all("/api/resources", requireAuthentication);
    app.all("/api/resources/*", requireAuthentication);
    // if (!app.locals.authorization.anonRead) {
    // app.all("/wiki/*", requireAuthentication);
    // app.all("/search", requireAuthentication);
    // }
}
