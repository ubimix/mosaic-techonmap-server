var Tools = require('./tools');
var config = require('./config');
var Q = require('q');
var _ = require('underscore');

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
        if (!data.userId) {
            data.userId = data.displayName + '@domain.com'
        }
        if (!data.id) {
            // data.id = data.userId;
            data.id = data.displayName;
        }
        return data;
    }

    function getUserId(userId, domain, displayName) {
        if (userId && userId != '')
            return userId;
        userId = displayName;
        userId = userId.replace(/[\s]/, '.').toLowerCase();
        if (domain) {
            userId = domain + ':' + userId;
        }
        return userId;
    }

    app.get('/api/auth/user', function(req, res) {
        if (req.user) {
            res.json(req.user);
        } else {
            res.json({});
        }

    });

    app.get('/api/auth/done', function(req, res) {
        var dst = req.session.destination || "/workspace";
        delete req.session.destination;
        res.redirect(dst);
    });

    app.get('/api/logout', function(req, res) {
        req.logout();
        req.session = null;
        res.redirect("/workspace");
    });

    /* ------------------------------------------------------------ */
    // Local
    passport.use(new LocalStrategy(function(username, password, done) {
        if (username.toLowerCase() != auth.alone.username.toLowerCase()
                || Tools.hashify(password) != auth.alone.passwordHash) {
            return done(null, false, {
                message : 'Incorrect username or password'
            });
        }

        var user = newUser({
            displayName : auth.alone.username,
            userId : getUserId(auth.alone.email, 'system', auth.alone.username)
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
        var userId = null;
        if (profile.emails && profile.emails.length) {
            var obj = profile.emails[0];
            userId = obj ? obj.value : null;
        }
        userId = getUserId(userId, 'gmail.com', profile.displayName);
        var user = newUser({
            displayName : profile.displayName,
            name : profile.name,
            userId : userId
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
            var userId = getUserId(null, profile.provider, profile.username);
            var user = newUser({
                displayName : profile.displayName,
                userId : userId
            });
            return done(undefined, user);
        }));

        // http://stackoverflow.com/questions/9885711/custom-returnurl-on-node-js-passports-google-strategy
        app.get("/api/auth/twitter", function(req, res, next) {
            req.session.destination = req.query.redirect;
            passport.authenticate('twitter', function(err, user, info) {
                next();
            })(req, res, next);
        });
        app.get("/api/auth/twitter/return", passport.authenticate('twitter', {
            successRedirect : '/api/auth/done',
            failureRedirect : '/login'
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
            console.log(profile)
            var user = newUser({
                displayName : profile.displayName,
                userId : getUserId(null, 'facebook.com', profile.displayName)
            });
            return done(undefined, user);
        }));
        app.get("/api/auth/facebook", passport.authenticate('facebook'));
        app.get("/api/auth/facebook/return", passport.authenticate('facebook',
                {
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
        // if (user.emails && user.emails.length > 0) { // Google
        // user.userId = user.emails[0].value;
        // delete user.emails;
        // }
        done(undefined, user);
    });

    /* ------------------------------------------------------------ */
    // var auth = app.locals.authentication = config.authentications
    var auth = app.locals.authentication = config.authentication;
    return Q(true);
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