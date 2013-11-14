var _ = require('underscore');
var client = require('./../client');

function skipMaster(req) {
    return _.any([ '/api', '/components', '/admin-css', '/js', '/build', '/map/' ], function(url) {
        return req.url.substr(0, url.length) === url;
    });
}

function hander(title, mainJs, mainCss) {
    return function(req, res, next) {
        if (skipMaster(req)) {
            // TODO: what is next
            return next();
        }

        var displayName = req.user ? req.user.displayName : 'Anonymous';
        res.render('index', {
            title : title,
            mainJs : mainJs,
            mainCss : mainCss,
            user : displayName
        });
    };
}

module.exports = {
    development : function() {
        return hander('jscr-webui', '/js/main.js', '/admin-css/main.css');
    },

    production : function() {
        return hander('jscr-webui', client.js, client.css);
    }
};