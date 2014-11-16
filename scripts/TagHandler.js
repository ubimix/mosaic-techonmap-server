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
    return {
        yaml : dataYaml,
        content : description
    };
}

function dumpSync(file, data) {
    var str = data.content + '\n\n-------\n\n' + data.yaml;
    Fs.writeFileSync(file, str);

}

function replaceTag(object, oldTag, newTag, file) {
    if (!object.tags)
        return;
    
    if (object.tags.indexOf(oldTag) >= 0) {
        var idx = object.tags.indexOf(oldTag);
        object.tags.splice(idx, 1, newTag);
        var data = toStructuredContent(object);
        dumpSync(file, data);
    }
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

        } else if (object.category == 'Entreprise') {
            
            replaceTag(object, 'b2b', 'B2B', file);
            replaceTag(object, 'apps', 'applications mobiles', file);
            replaceTag(object, 'design', 'webdesign', file);
            replaceTag(object, 'Design', 'webdesign', file);
            replaceTag(object, 'conseils', 'conseil', file);
            replaceTag(object, 'jeu', 'Jeux vidéo', file);
            replaceTag(object, 'reseausocial', 'réseau social', file);
        } else if (object.category == 'École') {
            
            replaceTag(object, 'designer', 'webdesign', file);
            replaceTag(object, 'Designer', 'webdesign', file);
            replaceTag(object, 'graphiste', 'webdesign', file);
            replaceTag(object, 'Graphiste', 'webdesign', file);
            
        } else if (object.category == 'Tiers-lieu') {
            
            replaceTag(object, 'bureau', 'bureaux partagés', file);
            replaceTag(object, 'bureaux', 'bureaux partagés', file);
            replaceTag(object, 'bureauxpartages', 'bureaux partagés', file);
            replaceTag(object, 'Graphiste', 'webdesign', file);
        }

    }

}).then(function() {
    ids = ids.sort();
    // _.each(ids, function(id) {
    // console.log(id);
    // })
    console.log(prestataires.length);
    console.log('done');
}).done();
