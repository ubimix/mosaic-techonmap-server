var express = require('express');
var http = require('http');
var path = require('path');
var fs = require("fs");
var middleware = require('./source/middleware');
var passport = require('passport');
var config = require('./source/config');
// needed by Passport LocalStrategy
var Flash = require('connect-flash');
var Q = require('q');
var _ = require('underscore');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('cookie-session');

var app = express();

app.locals.port = config.server.port || process.env.PORT || 6067;
app.locals.hostname = config.server.hostname || "localhost";
// baseUrl is used as the public url
app.locals.baseUrl = config.server.baseUrl
        || ("http://" + app.locals.hostname + ":" + app.locals.port)

var oneMonth = 30 * 24 * 60 * 60 * 1000;

function listFolders(folderPath, callback) {

    fs.readdir(folderPath, function(err, files) {
        if (err) {
            return callback(err, null);
        }
        folders = files.map(function(file) {
            return path.join(folderPath, file);
        }).filter(function(file) {
            return fs.statSync(file).isDirectory();
        });
        callback(null, folders);
    });
}

//app.configure(function() {
    app.set('port', app.locals.port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    //app.use(express.favicon());
    //app.use(express.logger('dev'));
    app.use(bodyParser.json());
//    app.use(express.methodOverride());
    // app.use(express.logger('default'));
    app.use(cookieParser());
    app.use(session({
        secret : "djinko-" + app.locals.secret,
        cookie : {
            maxAge : oneMonth
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(Flash());

//});

//app.configure('development', function() {
    //app.use(express.errorHandler());
    app.use('/', express.static(path.join(__dirname, 'public/techonmap')));
    // listFolders(path.join(__dirname, 'public'), function(err, folders) {
    // folders.forEach(function(folder, array, index) {
    // app.use('/backoffice/' + path.basename(folder), express.static(path
    // .join(__dirname, 'public/' + path.basename(folder))));
    // });
    //
    // });

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(middleware.serveMaster.development());
//});

/*app.configure('production', function() {
    app.use(express.compress());
    app.use(express.static(path.join(__dirname, 'public'), {
        maxAge : oneMonth
    }));
    app.use(middleware.serveMaster.production());
});*/

Q()
// Configure access control
.then(function() {
    return require('./source/config.access')(app);
})
// Configure OAuth passports for individual providers (G+, FB, TW, LiN)
.then(function() {
    return require('./source/config.passport')(app);
})
// Configure the API to access resources
.then(function() {
    return require('./source/api/resources')(app);
})
// Instantiate and run an HTTP server
.then(function() {
    var server = http.createServer(app);
    return Q.nfcall(_.bind(server.listen, server), app.get('port'))
})
// Print out the address of the main page
.then(function(r) {
    var port = app.get('port');
    console.log("http://127.0.0.1:" + port + '/workspace/');
    return r;
})
// Handle errors and finish the initialization process
.done();
