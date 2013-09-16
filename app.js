var express = require('express');
var http = require('http');
var path = require('path');
var middleware = require('./source/middleware');
var passport = require('passport');
var config = require('./source/config');
var configPassport = require('./source/config.passport');

var app = express();


app.locals.port = config.server.port || process.env.PORT || 6067;
app.locals.hostname = config.server.hostname || "localhost";
// baseUrl is used as the public url
app.locals.baseUrl = config.server.baseUrl || ("http://" + app.locals.hostname + ":" + app.locals.port)


var oneMonth = 2678400000;

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    //app.use(express.logger('default'));
    app.use(express.cookieParser(app.locals.secret));
    app.use(express.cookieSession({
        secret : "djinko-" + app.locals.secret,
        cookie : {
            maxAge : 30 * 24 * 60 * 60 * 1000
        }
    })); // a Month
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(passport.initialize());
    app.use(passport.session());

});

app.configure('development', function() {
    app.use(express.errorHandler());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(middleware.serveMaster.development());
});

app.configure('production', function() {
    app.use(express.compress());
    app.use(express.static(path.join(__dirname, 'public'), {
        maxAge : oneMonth
    }));
    app.use(middleware.serveMaster.production());
});

// api endpoints
require('./source/api/resources')(app);

configPassport(app);

http.createServer(app).listen(app.get('port'), function() {
    var environment = process.env.NODE_ENV || 'development';
    console.log('Wikicli started: ' + app.get('port') + ' (' + environment + ')');
});
