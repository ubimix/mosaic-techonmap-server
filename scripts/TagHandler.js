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
    if (!object.tags || object.tags.length==0)
        return;
    
    var lowerCaseTags = [];
    _.each(object.tags, function(tag) {
        lowerCaseTags.push(tag.toLowerCase());
    });
    
    object.tags = lowerCaseTags;
    
    if (object.tags.indexOf(oldTag) >= 0) {
        var idx = object.tags.indexOf(oldTag);
        if (object.tags.indexOf(newTag) < 0) {
            object.tags.splice(idx, 1, newTag);
        } else {
            object.tags.splice(idx, 1);
        }
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


function removeTag(object, oldTag, file) {
    if (!object.tags || object.tags.length==0)
        return;
    
    var lowerCaseTags = [];
    _.each(object.tags, function(tag) {
        lowerCaseTags.push(tag.toLowerCase());
    });
    
    object.tags = lowerCaseTags;
    
    if (object.tags.indexOf(oldTag) >= 0) {
        var idx = object.tags.indexOf(oldTag);
        object.tags.splice(idx, 1);
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

        } 
            
        //replaceTag(object, 'b2b', 'B2B', file);
        replaceTag(object, 'apps', 'applications mobiles', file);
        replaceTag(object, 'design', 'webdesign', file);
        replaceTag(object, 'conseils', 'conseil', file);
        replaceTag(object, 'jeu', 'jeux vidéo', file);
        replaceTag(object, 'reseausocial', 'réseau social', file);
        replaceTag(object, 'recommerce', 'ecommerce', file);
        replaceTag(object, 'mcommerce', 'ecommerce', file);
        replaceTag(object, 'marketplaces', 'marketplace', file);
        replaceTag(object, 'sante', 'santé', file);
        replaceTag(object, 'esante', 'santé', file);
        replaceTag(object, 'silvereconomy', 'silver économie', file);
        replaceTag(object, 'silvereco', 'silver économie', file);
        addTagIfTag(object,'silver économie', 'santé', file);

        replaceTag(object, 'education', 'éducation', file);
        
        replaceTag(object, 'cinema', 'cinéma', file);
        addTagIfTag(object,'cinéma', 'culture', file);
        
        replaceTag(object, 'mobilite', 'mobilité', file);
        replaceTag(object, 'geolocalisation', 'géolocalisation', file);
        addTagIfTag(object,'géolocalisation', 'mobilité', file);
        
        replaceTag(object, 'greent it', 'environnement', file);
        replaceTag(object, 'developpementdurable', 'environnement', file);

        replaceTag(object, 'voyage', 'tourisme', file);
        replaceTag(object, 'vacances', 'tourisme', file);
        replaceTag(object, 'bigdata', 'big data', file);
        replaceTag(object, 'telecommunications', 'telecoms', file);
//        replaceTag(object, 'ingénierie', 'SSII', file);
//        replaceTag(object, 'ingéniérie', 'SSII', file);
//        replaceTag(object, 'ingenierie', 'SSII', file);
        
        replaceTag(object, 'ingénierie ', 'ingénierie', file);
        replaceTag(object, 'cloudcomputing', 'cloud', file);
        
        replaceTag(object, 'economie collaborative', 'économie collaborative', file);
        replaceTag(object, 'equipement', 'équipement', file);
        replaceTag(object, 'securite', 'sécurité', file);
        replaceTag(object, 'semantique', 'sémantique', file);
        
        
        replaceTag(object, 'designer', 'webdesign', file);
        replaceTag(object, 'Designer', 'webdesign', file);
        replaceTag(object, 'graphiste', 'webdesign', file);
        replaceTag(object, 'Graphiste', 'webdesign', file);
        
        replaceTag(object, 'ingénieurs', 'ingénieur', file);
        replaceTag(object, 'programmeur', 'développeur', file);
        replaceTag(object, 'telecom', 'telecoms', file);
        
        
        replaceTag(object, 'bureau', 'bureaux partagés', file);
        replaceTag(object, 'bureaux', 'bureaux partagés', file);
        replaceTag(object, 'bureauxpartages', 'bureaux partagés', file);
// replaceTag(object, 'Graphiste', 'webdesign', file);
          replaceTag(object, 'maker', 'makerspace', file);
          
        replaceTag(object, 'federation', 'fédération', file);
        replaceTag(object, 'developpeur', 'développeur', file);
        replaceTag(object, 'accelerateur', 'accélérateur', file);
        replaceTag(object, 'accelerator', 'accélérateur', file);
        addTagIfTag(object, 'accompagnement', 'incubateur', file);
        addTagIfTag(object, 'coaching', 'incubateur', file);
        
        replaceTag(object, 'venture capitalist', 'capital risque', file);
        replaceTag(object, 'venturecapitalist', 'capital risque', file);
        
        replaceTag(object, 'businessangel', 'business angel', file);
        
        replaceTag(object, 'venture capital', 'capital risque', file);
        replaceTag(object, 'greentech', 'cleantech', file);
        replaceTag(object, 'hebergement', 'hébergement', file);
        
        ///-------
        removeTag(object, 'numérique', file);
        removeTag(object, 'numerique', file);
        
        removeTag(object, 'tic', file);
        removeTag(object, 'ict', file);
        removeTag(object, 'digital', file);
        
        //"applis/applications" : à traiter à la main
        replaceTag(object, 'associations', 'association', file);
        replaceTag(object, 'application mobile', 'applications mobiles', file);
        
        replaceTag(object, 'telecom', 'télécoms', file);
        replaceTag(object, 'telecoms', 'télécoms', file);
        
        replaceTag(object, 'photos', 'photo', file);
        replaceTag(object, 'jeuvideo', 'jeux vidéo', file);
        replaceTag(object, 'jeu_video', 'jeux vidéo', file);
        
        replaceTag(object, 'television', 'télévision', file);
        replaceTag(object, 'place de marché', 'marketplace', file);
        replaceTag(object, 'advergame', 'advertgame', file);
        
        replaceTag(object, 'e-santé', 'santé', file);
        
        replaceTag(object, 'freelance', 'indépendant', file);
        
        replaceTag(object, 'greenit', 'environnement', file);
        replaceTag(object, 'artistes', 'artiste', file);
        
        replaceTag(object, 'energie', 'énergie', file);
        replaceTag(object, 'multimedia', 'multimédia', file);
        replaceTag(object, 'media', 'médias', file);
        replaceTag(object, 'medias', 'médias', file);
        replaceTag(object, 'creation', 'création', file);
        replaceTag(object, 'edition', 'édition', file);
        replaceTag(object, 'ingenieur', 'ingénieur', file);
        replaceTag(object, 'developpement', 'développement', file);
        replaceTag(object, 'developpeur', 'développeur', file);
        replaceTag(object, 'dematerialisation', 'dématerialisation', file);
        replaceTag(object, 'evenements', 'événements', file);
        replaceTag(object, 'aeronautique', 'aéronautique', file);
        replaceTag(object, 'accelerateur', 'accélérateur', file);
        replaceTag(object, 'academie', 'académie', file);
        replaceTag(object, 'apero', 'apéro', file);
        replaceTag(object, 'bandedessinee', 'bande dessinée', file);
        
        replaceTag(object, 'transmedia', 'transmédia', file);
        
        replaceTag(object, 'integrateur', 'intégrateur', file);
        
        replaceTag(object, 'service de proximite', 'service de proximité', file);
        
        replaceTag(object, 'collectivites', 'collectivités', file);
        
        replaceTag(object, 'etude', 'études', file);
        replaceTag(object, 'etudes', 'études', file);
        
        replaceTag(object, 'reservation', 'réservations', file);
        
        replaceTag(object, 'debat', 'débat', file);
        replaceTag(object, 'bibliotheque', 'bibliothèque', file);
        
        replaceTag(object, 'video', 'vidéo', file);
        
        replaceTag(object, 'education', 'éducation', file);
        replaceTag(object, 'pepiniere', 'pépinière', file);
        
        replaceTag(object, 'economiecollaborative', 'économie collaborative', file);
        replaceTag(object, 'moteurderecherche', 'moteur de recherche', file);
        replaceTag(object, 'objetsconnectes', 'objets connectés', file);
        replaceTag(object, 'objet connecté', 'objets connectés', file);
        replaceTag(object, 'conseilregional', 'conseil régional', file);
        replaceTag(object, 'organismeassocie', 'organismes associés', file);
        
        replaceTag(object, 'tempsreel', 'temps réel', file);
        replaceTag(object, 'realiteaugmentee','réalité augmentée', file);
        replaceTag(object, 'fidelisation','fidélisation', file);
        replaceTag(object, 'développeur','développeurs', file);
        
        replaceTag(object, 'music', 'musique', file);
        replaceTag(object, 'photographe', 'photo', file);
        replaceTag(object, 'photographie', 'photo', file);
        
        replaceTag(object, 'sports', 'sport', file);
        replaceTag(object, 'jeux mobiles', 'mobiles', file);
        
        replaceTag(object, 'servicedeproximite', 'services de proximité', file);
        replaceTag(object, 'services de proximite', 'services de proximité', file);
        
        replaceTag(object, 'handicapée', 'handicap', file);
        
        replaceTag(object, 'telemedicine', 'santé', file);
        replaceTag(object, 'objects connectés', 'objets connectés', file);
        
        
        
        removeTag(object, 'logiciels informatique', file);
        removeTag(object, 'it', file);
        removeTag(object, 'reseau', file);
        removeTag(object, 'lunette', file);
        removeTag(object, 'pointdevente', file);
        removeTag(object, '2b2', file);
        removeTag(object, 'contenus', file);
        removeTag(object, 'ingéniérie informatique', file);
        removeTag(object, 'ingénierie informatique', file);
        removeTag(object, 'achatdurable', file);
        removeTag(object, 'reingenierie', file);
        removeTag(object, 'laboratoires', file);
        removeTag(object, 'usb', file);
        removeTag(object, 'reingenierie', file);
        removeTag(object, 'communaute', file);
        removeTag(object, 'alfresco', file);
        removeTag(object, 'infrastructures', file);
        removeTag(object, 'plateforme multeegaming', file);
        removeTag(object, 'dons', file);
        removeTag(object, 'multikrens', file);
        removeTag(object, 'km', file);
        removeTag(object, 'aventure', file);
        removeTag(object, 'soa', file);
        removeTag(object, 'question', file);
        removeTag(object, 'signal', file);
        removeTag(object, 'microsoft', file);
        removeTag(object, 'logiciel informatique', file);
        removeTag(object, 'echanges', file);
        removeTag(object, 'participative', file);
        removeTag(object, 'emulation', file);
        removeTag(object, 'concertation', file);
        removeTag(object, 'centreaffaires', file);
        removeTag(object, 'cabinet', file);
        removeTag(object, 'films', file);
        removeTag(object, 'libertes', file);
        
        removeTag(object, 'echange entre pro', file);
        removeTag(object, 'troc 3.0', file);
        
        removeTag(object, 'creativetechnologist', file);
        removeTag(object, 'installations informatiques', file);
        removeTag(object, 'deveco', file);
        removeTag(object, 'digitale', file);
        removeTag(object, 'edition musicale', file);
        removeTag(object, 'emulationlogicielle', file);
        removeTag(object, 'doue', file);
        removeTag(object, 'delegation', file);
        
        removeTag(object, 'mecanique', file);
        removeTag(object, 'symfony', file);
        removeTag(object, 'multicanal', file);
        removeTag(object, 'administration', file);
        removeTag(object, 'entrepreneuriat', file);
        removeTag(object, 'mecanique', file);
        removeTag(object, 'nûmerique', file);
        removeTag(object, 'emotion', file);
        
        
        removeTag(object, 'site', file);
        removeTag(object, 'númerique', file);
        removeTag(object, 'identite', file);
        
        removeTag(object, 'filedattente', file);
        
        removeTag(object, 'serviceclients', file);

        removeTag(object, 'groupe', file);
        removeTag(object, 'excursions', file);
        removeTag(object, 'defence', file);
        
        removeTag(object, 'géographique', file);

        removeTag(object, 'ingenerie', file);
        
        removeTag(object, 'reparation', file);
        removeTag(object, 'commercants', file);
        
        removeTag(object, 'revenuscomplementaires', file);
        removeTag(object, 'appareilsintelligents', file);
        removeTag(object, 'inscription', file);
        removeTag(object, 'siteweb', file);
        removeTag(object, 'permis de conduire', file);
        removeTag(object, 'telemedecine', file);
        removeTag(object, 'pitch', file);
        removeTag(object, 'utilisateur', file);
        removeTag(object, 'content', file);
        removeTag(object, 'pluridisciplainaire', file);
        removeTag(object, 'commande', file);
        removeTag(object, 'site de contenu', file);
        removeTag(object, 'rv', file);
        removeTag(object, 'websitebuilder', file);
        removeTag(object, 'anglais', file);
        removeTag(object, 'travail collaborative', file);
        removeTag(object, 'programmation informatique.', file);
        removeTag(object, 'contenus&services', file);
        removeTag(object, "écialisée dans le secteur d'activité de l'ingénierie", file);
        
        
        
        
        
        
    }

}).then(function() {
    ids = ids.sort();
    // _.each(ids, function(id) {
    // console.log(id);
    // })
    console.log('done');
}).done();

