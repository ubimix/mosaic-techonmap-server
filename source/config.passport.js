var Tools = require('./tools');
var config = require('./config');
var Q = require('q');
var _ = require('underscore');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LinkedInStrategy = require('passport-linkedin').Strategy;

/*
 * Passport configuration
 */
module.exports = function(app) {

    // 
    function getRedirectUrl(path) {
        var baseUrl = app.locals.baseUrl || '';
        //FIXME: check whether the baseUrl ends with a '/'
	//and also check whether path is a relative or absolute URL
        if (path && path.indexOf('/') != 0)
             path = '/' + path;
        return baseUrl + path;
    }

    function escapeDisplayName(name) {
        return name.replace(/[\s]/, '.').toLowerCase();
    }

    function newUser(data) {
        data.id = data.provider + ':' + escapeDisplayName(data.displayName);
        // FIXME: remove it (need to replace access rules in config.yaml to use
        // real IDs)
        data.id = data.displayName;
        return data;
    }

    function getAccountId(accountId, domain, displayName) {
        if (accountId && accountId != '')
            return accountId;
        accountId = escapeDisplayName(displayName);
        if (domain) {
            accountId = domain + ':' + accountId;
        }
        return accountId;
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
        res.redirect(getRedirectUrl(dst));
    });

    app.get('/api/logout', function(req, res) {
        var redirectTarget = req.query.redirect || "/workspace";
        req.logout();
        req.session = null;
        res.redirect(getRedirectUrl(redirectTarget));
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
            accountId : getAccountId(auth.alone.email, 'system',
                    auth.alone.username)
        });

        return done(undefined, user);
    }));
    app.post("/api/login", passport.authenticate('local', {
        successRedirect : getRedirectUrl('/api/auth/done'),
        failureRedirect : getRedirectUrl('/login'),
        failureFlash : true
    }));

    /* ------------------------------------------------------------ */
    // Google-based
    passport.use(new GoogleStrategy({
        returnURL : getRedirectUrl('/api/auth/google/return'),
        realm : app.locals.baseUrl
    }, function(identifier, profile, done) {
        var accountId = null;
        if (profile.emails && profile.emails.length) {
            var obj = profile.emails[0];
            accountId = obj ? obj.value : null;
        }
        accountId = getAccountId(accountId, 'gmail.com', profile.displayName);
        var user = newUser({
            accountId : accountId,
            displayName : profile.displayName,
            name : profile.name,
            provider : 'google'
        });
        done(undefined, user);
    }));
    app.get("/api/auth/google", function(req, res, next) {
        req.session.destination = req.query.redirect;
        passport.authenticate('google', function(err, user, info) {
            next();
        })(req, res, next);
    });
    
    
    app.get("/api/auth/google/return", passport.authenticate('google', {
        successRedirect : getRedirectUrl('/api/auth/done'),
        failureRedirect : getRedirectUrl('/login')
    }));

    /* ------------------------------------------------------------ */
    // Twitter-based
    var twitterConfig = config.authentication.twitter;
    if (twitterConfig.oauthkeys) {
        passport.use(new TwitterStrategy({
            consumerKey : twitterConfig.oauthkeys.consumerKey,
            consumerSecret : twitterConfig.oauthkeys.consumerSecret,
            callbackURL : getRedirectUrl('/api/auth/twitter/return')
        }, function(token, tokenSecret, profile, done) {
            var provider = 'twitter';
            var accountId = getAccountId(null, provider, profile.username);
            var user = newUser({
                accountId : accountId,
                displayName : profile.displayName,
                provider : provider
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
            successRedirect : getRedirectUrl('/api/auth/done'),
            failureRedirect : getRedirectUrl('/login')
        }));
    }
    
    /* ------------------------------------------------------------ */
    // LinkedIn-based
    var linkedInConfig = config.authentication.linkedin;
    if (linkedInConfig.oauthkeys) {
        passport.use(new LinkedInStrategy({
            consumerKey : linkedInConfig.oauthkeys.consumerKey,
            consumerSecret : linkedInConfig.oauthkeys.consumerSecret,
            callbackURL : getRedirectUrl('/api/auth/linkedin/return')
        }, function(token, tokenSecret, profile, done) {
            var provider = 'linkedin';
            var accountId = getAccountId(null, provider, profile.displayName);
            var user = newUser({
                accountId : accountId,
                displayName : profile.displayName,
                provider : provider
            });
            return done(undefined, user);
        }));

        // http://stackoverflow.com/questions/9885711/custom-returnurl-on-node-js-passports-google-strategy
        app.get("/api/auth/linkedin", function(req, res, next) {
            req.session.destination = req.query.redirect;
            passport.authenticate('linkedin', function(err, user, info) {
                next();
            })(req, res, next);
        });
        app.get("/api/auth/linkedin/return", passport.authenticate('linkedin', {
            successRedirect : getRedirectUrl('/api/auth/done'),
            failureRedirect : getRedirectUrl('/login')
        }));
    }    

    /* ------------------------------------------------------------ */
    var facebookConfig = config.authentication.facebook;
    if (facebookConfig.oauthkeys) {
        passport.use(new FacebookStrategy({
            clientID : facebookConfig.oauthkeys.clientID,
            clientSecret : facebookConfig.oauthkeys.clientSecret,
            callbackURL : getRedirectUrl('/api/auth/facebook/return')
        }, function(accessToken, refreshToken, profile, done) {
            var user = newUser({
                accountId : getAccountId(null, 'facebook.com',
                        profile.displayName),
                displayName : profile.displayName,
                provider : 'facebook'
            });
            return done(undefined, user);
        }));
        app.get("/api/auth/facebook", passport.authenticate('facebook'));
        app.get("/api/auth/facebook/return", passport.authenticate('facebook',
                {
                    successRedirect : getRedirectUrl('/api/auth/done'),
                    failureRedirect : getRedirectUrl('/login')
                }));
    }

    /* ------------------------------------------------------------ */
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    /* ------------------------------------------------------------ */
    passport.deserializeUser(function(user, done) {
        // if (user.emails && user.emails.length > 0) { // Google
        // user.accountId = user.emails[0].value;
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
