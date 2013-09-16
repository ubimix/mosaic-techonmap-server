var express = require('express');
var http = require('http');
var path = require('path');
var middleware = require('./source/middleware');

var app = express();

var oneMonth = 2678400000;

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
});

app.configure('development', function(){
	app.use(express.errorHandler());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(middleware.serveMaster.development());
});

app.configure('production', function(){
	app.use(express.compress());
	app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneMonth }));
	app.use(middleware.serveMaster.production());
});

// api endpoints
require('./source/api/auth')(app);
require('./source/api/resources')(app);

http.createServer(app).listen(app.get('port'), function(){
	var environment = process.env.NODE_ENV || 'development';
	console.log('Wikicli started: ' + app.get('port') + ' (' + environment + ')');
});
