var twitter = require('ntwitter');
var config = require('../config');
var LRU = require("lru-cache")

var twitterConfig = config.twitterClient;

var options = {
    max : 1,
    maxAge : twitterConfig.cacheExpire
};

var cache = LRU(options);

var twitterlib = {

    fetchLastTweet : function(screenName, callback) {
        var tweet = cache.get('tweet');
        if (tweet) {
            return callback(null, tweet);
        }

        var twclient = new twitter({
            consumer_key : twitterConfig.consumerKey,
            consumer_secret : twitterConfig.consumerSecret,
            access_token_key : twitterConfig.accessTokenKey,
            access_token_secret : twitterConfig.accessTokenSecret
        });

        twclient.get('/statuses/user_timeline.json', {
            screen_name : screenName
        }, function(err, data) {
            if (err) {
                //throw new Error(err.toString());
                console.log('!! TWITTERLIB ERROR:', err.toString());
	    } else {
                if (data && data.length > 0)
                    cache.set('tweet', data[0]);
                return callback(err, cache.get('tweet'));
            }
        });
    }
}

module.exports = twitterlib;
