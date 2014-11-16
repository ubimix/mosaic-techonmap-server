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

function replaceTag(object, oldTag, newTag) {
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
            
            replaceTag(object, 'b2b', 'B2B');
            replaceTag(object, 'apps', 'applications mobiles');
            replaceTag(object, 'design', 'webdesign');
            replaceTag(object, 'Design', 'webdesign');
            replaceTag(object, 'conseils', 'conseil');
            replaceTag(object, 'jeu', 'Jeux vidéo');
            replaceTag(object, 'reseausocial', 'réseau social');
        } else if (object.category == 'École') {
            
            replaceTag(object, 'designer', 'webdesign');
            replaceTag(object, 'Designer', 'webdesign');
            replaceTag(object, 'graphiste', 'webdesign');
            replaceTag(object, 'Graphiste', 'webdesign');
            
        } else if (object.category == 'Tiers-lieu') {
            
            replaceTag(object, 'bureau', 'bureaux partagés');
            replaceTag(object, 'bureaux', 'bureaux partagés');
            replaceTag(object, 'bureauxpartages', 'bureaux partagés');
            replaceTag(object, 'Graphiste', 'webdesign');
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