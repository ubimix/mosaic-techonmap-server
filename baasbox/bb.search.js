var Path = require('path');
var BaasBoxCli = require('./baasbox-cli');
var Vistor = require('./file-visitor');
var Fs = require('fs');
var _ = require('underscore');
var Q = require('q');

var client = new BaasBoxCli({
    username : 'arkub',
    password : '[leliendéfait]',
    appcode : '1234567890'
});

client.login().then(function() {
    return client.getDocument('arkdjk','d3884881-c935-4bb9-b154-16a4a0771fa7').then(function(doc) {
        console.log(JSON.stringify(doc, null, 2));
        return Q();
    });
    
}).fail(function(error) {
    console.log(error);
}).done();