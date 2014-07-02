var Path = require('path');
var BaasBoxCli = require('./baasbox-cli');
var Vistor = require('./file-visitor');
var Fs = require('fs');
var _ = require('underscore');
var Q = require('q');

var config = require('./config');

var client = new BaasBoxCli({
    username : config.baasbox.username,
    password : config.baasbox.password,
    appcode : config.baasbox.appcode
});

client.login().then(function(session) {

    return client.deleteCollection('commerces').then(function(result) {
        console.log('[result]', result);
    });

    // return client.storeResource('commerces', {
    // title : 'hello',
    // name : 'Chez Peter Pan'
    // }).then(function(result) {
    // console.log('[result]', result);
    // });

    // }).then(function(session) {
    //
    // var criteria = encodeURIComponent('properties.name like \'Under%\'');
    // var params = {
    // where : criteria,
    // page : 0,
    // fields : 'properties,id'
    // }
    //
    // return client.queryCollection('arkdjk', params).then(function(data) {
    // console.log(JSON.stringify(data, null, 2));
    // });
    //    

}).fail(function(error) {
    if (error)
        console.log(error);
}).done();