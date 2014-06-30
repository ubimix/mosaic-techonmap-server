#!/usr/bin/env node

var Path = require('path');
var ElasticSearch = require('elasticsearch');
var Vistor = require('./file-visitor');
var Yaml = require('yamljs');
var Fs = require('fs');
var _ = require('underscore');
var Q = require('q');


var client = new ElasticSearch.Client({
    host : 'localhost:9200',
    log: {
        type: 'file',
        level: 'error',
        path: './elasticsearch.log'
      }
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
    return [content, properties];
}


var baseDir = '/home/arkub/git/djinko/repository/';
//var baseDir = '/home/arkub/git/djinko/dev/';
var indexName = 'idx2';

client.indices.exists({
    index : indexName
}).then(function(exists) {

    if (exists) {
        return client.indices.delete({
            index : indexName 
            
        })};
    return Q();
}).then(function() {

    return client.indices.create({
        index : indexName 
    })
}).then(function() {

    return client.indices.putMapping({
        index : indexName ,
        type: 'resource',
        body : {
        resource: {
          properties: {
            name: {type: 'string'},
            suggest : { type : 'completion',
                index_analyzer : 'simple',
                search_analyzer : 'simple',
                payloads : true
            },
            content: {type: 'string'},
            relations: {
              type : 'nested',
              properties : {id: {type:'string'}}
            }
           }
         }
      }
    });

}).then(function() {

    Vistor.visit(baseDir, function(file, directory) {
        if (directory)
            return;
        var ext = Path.extname(file);
        if (ext !== '.md')
            return;
        
        var content = Fs.readFileSync(file, {encoding : 'utf8'});
        // TODO: why errors wont' propagate (when there is an error in
        // deserializeResource
        var resource = deserializeResource(content);
        var id = Path.dirname(file).substring(baseDir.length);
        
        var request = {
                index : indexName ,
                type : 'resource',
                id : id,
                body : {
                    name : resource[1].name,
                    suggest : {
                        input: [ resource[1].name],
                        output: resource[1].name
                    },
                    relations : resource[1].relations,
                    content: resource[0]
               }
           };
        
       
        return client.index(request, function(result) {
            
            console.log('indexed...', file);
                
        }, function(error) {
            if (error)
            console.log(error);
        });
      
    
    });
}).done();