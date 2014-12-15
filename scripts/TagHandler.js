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


function addTagIfTag(object, ifTag, newTag, file) {
    if (!object.tags)
        return;
    
    if (object.tags.indexOf(ifTag) >= 0 && object.tags.indexOf(newTag) < 0) {
        object.tags.push(newTag);
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
            
//            replaceTag(object, 'b2b', 'B2B', file);
//            replaceTag(object, 'apps', 'applications mobiles', file);
//            replaceTag(object, 'design', 'webdesign', file);
//            replaceTag(object, 'Design', 'webdesign', file);
//            replaceTag(object, 'conseils', 'conseil', file);
//            replaceTag(object, 'jeu', 'Jeux vidéo', file);
//            replaceTag(object, 'reseausocial', 'réseau social', file);
//            replaceTag(object, 'recommerce', 'ecommerce', file);
//            replaceTag(object, 'mcommerce', 'ecommerce', file);
//            replaceTag(object, 'marketplaces', 'marketplace', file);
//            replaceTag(object, 'sante', 'santé', file);
//            replaceTag(object, 'esante', 'santé', file);
//            replaceTag(object, 'silvereconomy', 'silver économie', file);
//            replaceTag(object, 'silvereco', 'silver économie', file);
//            addTagIfTag(object,'silver économie', 'santé', file);
//            
//            replaceTag(object, 'education', 'éducation', file);
//            
//            replaceTag(object, 'cinema', 'cinéma', file);
//            addTagIfTag(object,'cinéma', 'culture', file);
//            
//            replaceTag(object, 'mobilite', 'mobilité', file);
//            replaceTag(object, 'geolocalisation', 'géolocalisation', file);
//            addTagIfTag(object,'géolocalisation', 'mobilité', file);
//            
//            replaceTag(object, 'greent it', 'environnement', file);
//            replaceTag(object, 'developpementdurable', 'environnement', file);
//
//            replaceTag(object, 'voyage', 'tourisme', file);
//            replaceTag(object, 'vacances', 'tourisme', file);
//            replaceTag(object, 'bigdata', 'big data', file);
//            replaceTag(object, 'telecommunications', 'telecoms', file);
//            replaceTag(object, 'ingénierie', 'SSII', file);
//            replaceTag(object, 'ingenierie', 'SSII', file);
//            replaceTag(object, 'cloudcomputing', 'cloud', file);
            
//            replaceTag(object, 'economie collaborative', 'économie collaborative', file);
//            replaceTag(object, 'equipement', 'équipement', file);
//            replaceTag(object, 'securite', 'sécurité', file);
//            replaceTag(object, 'semantique', 'sémantique', file);
            
                replaceTag(object, 'hebergement', 'hébergement', file);
            
        } else if (object.category == 'École') {
            
//            replaceTag(object, 'designer', 'webdesign', file);
//            replaceTag(object, 'Designer', 'webdesign', file);
//            replaceTag(object, 'graphiste', 'webdesign', file);
//            replaceTag(object, 'Graphiste', 'webdesign', file);
            
//            replaceTag(object, 'ingénieurs', 'ingénieur', file);
//            replaceTag(object, 'programmeur', 'développeur', file);
//            replaceTag(object, 'telecom', 'telecoms', file);
            
            
        } else if (object.category == 'Tiers-lieu') {
            
//            replaceTag(object, 'bureau', 'bureaux partagés', file);
//            replaceTag(object, 'bureaux', 'bureaux partagés', file);
//            replaceTag(object, 'bureauxpartages', 'bureaux partagés', file);
//            replaceTag(object, 'Graphiste', 'webdesign', file);
              replaceTag(object, 'maker', 'makerspace', file);
              
        } else {
            
//            replaceTag(object, 'federation', 'fédération', file);
//            replaceTag(object, 'accélérator', 'accélérateur', file);
//            addTagIfTag(object, 'accompagnement', 'incubateur', file);
//            addTagIfTag(object, 'coaching', 'incubateur', file);
//            
//            replaceTag(object, 'venture capitalist', 'capital risque', file);
//            replaceTag(object, 'venture capital', 'capital risque', file);
//            replaceTag(object, 'greentech', 'cleantech', file);
        }

    }

}).then(function() {
    ids = ids.sort();
    // _.each(ids, function(id) {
    // console.log(id);
    // })
    console.log('done');
}).done();

