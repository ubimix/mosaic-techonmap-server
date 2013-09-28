var Tools = require('./tools');
var config = require('./config');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

/*
 * Passport configuration
 */
module.exports = function(app) {

    function newUser(data) {
        if (!data.email) {
            data.email = data.displayName + '@domain.com'
        }
        if (!data.id) {
            // data.id = data.email;
            data.id = data.displayName;
        }
        return data;
    }

    app.get('/api/auth/user', function(req, res) {
        if (req.user) {
            res.json(req.user);
        } else {
            res.json({});
        }

    });

    app.get('/api/auth/done', function(req, res) {

        // console.log('User: ', req.user);
        if (!req.user) {
            var dst = req.session.destination || "/";
            delete req.session.destination;
            res.redirect(dst);
            return;
        } else {
            var dst = req.session.destination || "/";
            delete req.session.destination;
            res.redirect(dst);
        }

    });

    app.get('/api/logout', function(req, res) {
        req.logout();
        req.session = null;
        res.redirect('/');
    });

    console.log(app.locals.baseUrl);

    /* ------------------------------------------------------------ */
    // Local
    passport.use(new LocalStrategy(function(username, password, done) {
        if (username.toLowerCase() != auth.alone.username.toLowerCase() || Tools.hashify(password) != auth.alone.passwordHash) {
            return done(null, false, {
                message : 'Incorrect username or password'
            });
        }

        var user = newUser({
            displayName : auth.alone.username,
            email : auth.alone.email || ""
        });

        return done(undefined, user);
    }));
    app.post("/api/login", passport.authenticate('local', {
        successRedirect : '/api/auth/done',
        failureRedirect : '/login',
        failureFlash : true
    }));

    /* ------------------------------------------------------------ */
    // Google-based
    passport.use(new GoogleStrategy({
        returnURL : app.locals.baseUrl + '/api/auth/google/return',
        realm : app.locals.baseUrl
    }, function(identifier, profile, done) {
        var user = newUser({
            displayName : profile.displayName,
            email : profile.email
        });
        done(undefined, user);
    }));
    app.get("/api/auth/google", passport.authenticate('google'));
    app.get("/api/auth/google/return", passport.authenticate('google', {
        successRedirect : '/api/auth/done',
        failureRedirect : '/login'
    }));

    /* ------------------------------------------------------------ */
    // Twitter-based
    var twitterConfig = config.authentication.twitter;
    if (twitterConfig.oauthkeys) {
        passport.use(new TwitterStrategy({
            consumerKey : twitterConfig.oauthkeys.consumerKey,
            consumerSecret : twitterConfig.oauthkeys.consumerSecret,
            callbackURL : app.locals.baseUrl + '/api/auth/twitter/return'
        }, function(token, tokenSecret, profile, done) {
            var user = newUser({
                displayName : profile.displayName
            });
            return done(undefined, user);
        }));
        
        //http://stackoverflow.com/questions/9885711/custom-returnurl-on-node-js-passports-google-strategy
        app.get("/api/auth/twitter", function(req, res, next) {
            req.session.destination = req.query.redirect;
            passport.authenticate('twitter', function(err, user, info) {
                next();
            })(req, res, next);
        });
        app.get("/api/auth/twitter/return", passport.authenticate('twitter', {
            successRedirect : '/api/auth/done',
            failureRedirect : '/api/auth/done'
        }));
    }

    /* ------------------------------------------------------------ */
    var facebookConfig = config.authentication.facebook;
    if (facebookConfig.oauthkeys) {
        passport.use(new FacebookStrategy({
            clientID : facebookConfig.oauthkeys.clientID,
            clientSecret : facebookConfig.oauthkeys.clientSecret,
            callbackURL : app.locals.baseUrl + '/api/auth/facebook/return'
        }, function(accessToken, refreshToken, profile, done) {
            var user = newUser({
                displayName : profile.displayName
            });
            return done(undefined, user);
        }));
        app.get("/api/auth/facebook", passport.authenticate('facebook'));
        app.get("/api/auth/facebook/return", passport.authenticate('facebook', {
            successRedirect : '/api/auth/done',
            failureRedirect : '/login'
        }));
    }

    /* ------------------------------------------------------------ */
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    /* ------------------------------------------------------------ */
    passport.deserializeUser(function(user, done) {
        if (user.emails && user.emails.length > 0) { // Google
            user.email = user.emails[0].value;
            delete user.emails;
        }
        user.asGitAuthor = user.displayName + " <" + user.email + ">";
        done(undefined, user);
    });

    /* ------------------------------------------------------------ */
    // var auth = app.locals.authentication = config.authentications
    var auth = app.locals.authentication = config.authentication;

    //
    // var authEnabled = false;
    // for ( var n in config.authentications) {
    // authEnabled |= config.authentications[n].enabled;
    // }
    // if (!authEnabled) {
    // console
    // .log("Error: no authentication method provided. Cannot continue.");
    // process.exit(-1);
    // }

};