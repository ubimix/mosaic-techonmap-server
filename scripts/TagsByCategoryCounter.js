var Fs = require('fs');
var _ = require('underscore');

var data = Fs.readFileSync('../data/entities.geo.json', {
    encoding : 'utf8'
});

var entities = JSON.parse(data);

var categoryTagMap = {};

_.each(entities.features, function(entity) {

    var tags = entity.properties.tags;
    var name = entity.properties.name;
    var category = entity.properties.category;

    // console.log(name, tags);

    var categoryTags = categoryTagMap[category];
    if (!categoryTags) {
        categoryTags = {};
        categoryTagMap[category] = categoryTags;
    }

    if (tags) {

        if (!Array.isArray(tags))
            tags = [ tags ];

        tags = tags.sort();

    }

    // console.log(name, tags);

    _.each(tags, function(tag) {
        var counter = categoryTags[tag];
        if (!counter)
            categoryTags[tag] = 1;
        else {
            categoryTags[tag] = counter + 1;
        }
    });
});

var str = '';
_.each(categoryTagMap, function(categoryTags, category) {
    str += category + ',\n';
    _.each(categoryTags, function(tagCounter, tag) {
        str += tag + ',' + tagCounter + '\n';
    })

})

console.log(str);