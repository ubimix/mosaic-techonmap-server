var Fs = require('fs');
var _ = require('underscore');
var Q = require('q');
var BaasBoxCli = require('./baasbox-cli');

var config = require('./config');

var client = new BaasBoxCli({
    username : config.baasbox.username,
    password : config.baasbox.password,
    appcode : config.baasbox.appcode
});

//TODO: check that baasbox is up and running

client.login().then(function(session) {
    console.log(session);
    var collection = config.dataSources[0].collection;
    
    return client.deleteCollection(collection).then(function(result) {
        console.log('[result]', result);
    });

}).then(function(result) {
    var collection = config.dataSources[0].collection;
    return client.createCollection(collection).then(function(result) {
        console.log('[result]', result);
    });
    
}).then(function(result) {

    var jsonFile = config.dataSources[0].source;
    var collection = config.dataSources[0].collection;
    console.log(jsonFile);
    var content = Fs.readFileSync(jsonFile, {
        encoding : 'utf8'
    });

    var features = JSON.parse(content);
    var promise = Q();
    
    _.each(features, function(feature) {
        promise = promise.then(function() {
            console.log('[storing]', feature.properties.name, feature.properties.type);
            //feature.content = feature.properties.description;
            //delete feature.properties.description;

            return client.storeResource(collection, feature).then(function(result) {
                console.log('[result]', result.result, result.data.properties.name);
            });
        });
        
    });
    return Q.all([ promise ]);
    
    
}).then(null, function(error) {
    console.log(error);
}).done();
