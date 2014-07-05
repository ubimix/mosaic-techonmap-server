var Path = require('path');
var BaasBoxCli = require('./baasbox-cli');
var Vistor = require('./file-visitor');
var Fs = require('fs');
var _ = require('underscore');
var P = require('when');

var config = require('./config');

var client = new BaasBoxCli({
    username : config.baasbox.username,
    password : config.baasbox.password,
    appcode : config.baasbox.appcode
});

client.login().then(function(session) {

    // return client.deleteCollection('commerces').then(function(result) {
    // console.log('[result]', result);
    // });

    // return client.uploadFile('/home/arkub/tmp/22661.png');

    return client.getFile('6137cead-955b-4a5e-a167-1eb6d7d812f8');

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
}).then(function(res) {
    console.log(res.headers['content-type'])
    var body = '';
    var file = Fs.createWriteStream("file.jpg");
    res.pipe(file);

    
}).then(null, function(error) {
    if (error)
        console.log(error);
}).done();