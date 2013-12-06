var _ = require('underscore');
var client = require('../client');
var config = require('../config');

function skipMaster(req) {
    return _.any([ '/api', '/components', '/admin-css', '/js', '/build',
            '/map/' ], function(url) {
        return req.url.substr(0, url.length) === url;
    });
}

function handle(title, mainJs, mainCss) {
    return function(req, res, next) {
        if (skipMaster(req)) {
            // TODO: what is next
            return next();
        }

        var user = req.user;
        var displayName = user ? user.displayName : 'Anonymous';
        var roles = user && user.roles ? req.roles : [];
        if (!roles.length)
            roles.push('guest');
        res.render('index', {
            title : title,
            mainJs : mainJs,
            mainCss : mainCss,
            user : displayName,
            roles : "['" + roles.join("','") + "']"
        });
    };
}

module.exports = {
    development : function() {
        return handle(config.application.title, '/js/main.js',
                '/admin-css/main.css');
    },

    production : function() {
        return handle(config.application.title, client.js, client.css);
    }
};