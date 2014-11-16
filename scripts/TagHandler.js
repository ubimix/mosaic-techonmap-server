// #!/usr/bin/env node

var dataFolder = '../repository/techonmap';
var contentFolder = '../content';
var _ = require('underscore');
var Fs = require('fs');
var Path = require('path');
var Visitor = require('./FileVisitor');
var Q = require('q');
var Yaml = require('yamljs');

function yamlToObject(description, yaml) {
    var description = (description || '').trim();
    var obj = Yaml.parse(yaml || '');
    if (obj)
        obj.description = description;
    return obj;
}

function toStructuredContent(obj) {
    var copy = JSON.parse(JSON.stringify(obj));
    var description = copy.description || '';
    delete copy.description;
    var dataYaml = Yaml.stringify(copy, 1, 2);
    // var text = description + "\n\n----\n" + dataYaml;
    return {yaml:dataYaml, content: description};
}

function dumpSync(file, data) {
    var str = data.content+'\n\n-------\n\n'+data.yaml;
    Fs.writeFileSync(file, str);
    
}

var counter = 0;
var ids = [];
var prestataires = [];

Visitor.visit(dataFolder, function(file, directory) {
    if (Path.extname(file) !== '.md')
        return;
    
    var content = Fs.readFileSync(file).toString();
    content = content.split('-------');
    var description = content[0].trim();
    var object = yamlToObject(description, content[1]);
    
    if (!object) {
        console.log(file);
    } else {
        ids.push(object.id);
        if (object.category == 'Prestataire') {
            prestataires.push(object);
            object.category = 'Entreprise';
            if (object.tags.indexOf('B2B') < 0)
                object.tags.push('B2B');
            var data = toStructuredContent(object);
            dumpSync(file, data);
            
        }
        
        if (object.tags && object.tags.indexOf('b2b') >=0) {
            
            var idx = object.tags.indexOf('b2b');
            object.tags.splice(idx, 1, 'B2B');
            var data = toStructuredContent(object);
            dumpSync(file, data);
        }
        
        if (object.tags && object.tags.indexOf('apps') >=0) {
            
            var idx = object.tags.indexOf('apps');
            object.tags.splice(idx, 1, 'applications mobiles');
            var data = toStructuredContent(object);
            dumpSync(file, data);
        }
        
        
    }
    
}).then(function() {
    ids = ids.sort();
//    _.each(ids, function(id) {
//        console.log(id);    
//    })
    console.log(prestataires.length);
    console.log('done');
}).done();