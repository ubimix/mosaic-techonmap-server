var _ = require('underscore');
var client = require('./../client');

function skipMaster (req) {
    console.log(req.url);
	return _.any(['/api', '/components', '/css', '/js', '/build'], function (url) {
		return req.url.substr(0, url.length) === url;
	});
}

function hander(title, mainJs, mainCss) {
	return function (req, res, next) {
	    if (skipMaster(req)) {
	        //TODO: what is next
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
	development: function () {
		return hander('jscr-webui', '/js/main.js', '/css/main.css');
	},

	production: function () {
		return hander('jscr-webui', client.js, client.css);
	}
};