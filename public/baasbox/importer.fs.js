var Path = require('path');
var BaasBoxCli = require('./baasbox-cli');
var Vistor = require('./file-visitor');
var Yaml = require('yamljs');
var Fs = require('fs');
var _ = require('underscore');
var Q = require('q');

var config = require('./config');

var client = new BaasBoxCli({
    username : config.baasbox.username,
    password : config.baasbox.password,
    appcode : config.baasbox.appcode
});


function split(content) {
    content = content || '';
    var array = content.split(/-------\n+/gim);
    content = array[0];
    var str = '';
    for ( var i = 1; i < array.length; i++) {
        if (str.length > 0)
            str += '\n';
        str += array[i];
    }
    // str = str.replace(/^\n+|\n+$/gm, '');
    // TODO: check
    // content = content.replace(/^\n+|\n+$/gm, '');
    return [ content, str ];
}

function deserializeResource(content) {
    var array = split(content);
    content = array[0];
    var str = array[1];
    var yaml = {};
    try {
        yaml = Yaml.parse(str) || {};
    } catch (e) {
        console.log('PARSE ERROR: ', e)
        yaml = {};
    }
    var properties = {}
    _.each(yaml, function(value, key) {
        var param = null;
        var family = 'properties';
        var idx = key.indexOf('.');
        if (idx > 0) {
            family = key.substring(0, idx);
            key = key.substring(idx + 1);
        }
        // var obj = resource.getPropertyFamily(family, true);

        properties[key] = value;
    });
    // var properties = resource.getProperties();
    // properties[ContentUtils.contentField] = content;
    // return resource;
    return {
        content : content,
        properties : properties
    };
}

var baseDir = '/home/arkub/git/djinko/repository/';
//var baseDir = '/home/arkub/git/djinko/dev/';

var promise = Q();
var counter = 0;
client.login().then(function() {

    Vistor.visit(baseDir, function(file, directory) {
        if (directory)
            return;
        var ext = Path.extname(file);
        if (ext !== '.md')
            return;

        var content = Fs.readFileSync(file, {
            encoding : 'utf8'
        });
        // TODO: why errors wont' propagate (when there is an error in
        // deserializeResource
        var resource = deserializeResource(content);
        var id = Path.dirname(file).substring(baseDir.length);
        // console.log(id, resource[0].length, resource[1]);
        promise = promise.then(function() {
            console.log('[storing]', id, counter);
            counter++;
            return client.storeDocument('arkdjk', resource).then(function(result) {
                console.log('[result]', result.result);
            });
        });

    });

    return Q.all([ promise ]);

}).fail(function(error) {
    console.log(error);
}).done();
