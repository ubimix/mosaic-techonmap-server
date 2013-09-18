var fieldMapping = {
    'Nom' : 'name',
    'Description' : 'description',
    'Tag 1' : 'tag1',
    'Tag 2' : 'tag2',
    'Tag 3' : 'tag3',
    'Latitude' : 'lat',
    'Longitude' : 'lng',
    'N° et nom de rue' : 'address',
    'CP' : 'postcode',
    'Ville' : 'city',
    'Année de création' : 'creationyear',
    'Url site web' : 'url',
    'Nom compte Twitter' : 'twitter',
    'Url page Facebook' : 'facebook',
    'Url page Google +' : 'googleplus',
    'Url page Linkedin' : 'linkedin',
    'Url page Viadeo' : 'viadeo'
}
 
function isEmpty(str) {
    if (!str)
        return true;
    return str + '' == '';
}
 
function trim(str) {
    if (!str)
        return '';
    return str.replace(/^\s+|\s+$/g, '');
}

function buildId(str) {
    str = trim(str);
    str = str.replace(/[\s,;\\/]+/gi, '_');
    str = str.replace(/^_+|_+$/g, '');
    str = str.toLowerCase();
    return str;
}

function getFieldsFromHeader(fieldMapping, header) {
    var result = [];
    for ( var i = 0; i < header.length; i++) {
        var h = header[i];
        var field = fieldMapping[h];
        result.push(field);
    }
    return result;
}

function toGeoJsonPoint(fields, array) {
    
    var properties = {};
    
    function removeProp(name) {
        var value = properties[name];
        delete properties[name];
        return value;
    }
    
    for ( var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (field) {
            var value = trim(array[i]);
            if (!isEmpty(value)) {
                properties[field] = value;
            }
        }
    }
    
    var id = buildId(properties.url);
    properties.id = id;
    var coordinates = [ parseFloat(removeProp('lat'))||0,
            parseFloat(removeProp('lng'))||0 ];
    var tags = [];
    var tag;
    if (!isEmpty(tag = removeProp('tag1')))
        tags.push(tag);
    if (!isEmpty(tag = removeProp('tag2')))
        tags.push(tag);
    if (!isEmpty(tag = removeProp('tag3')))
        tags.push(tag);
    if (tags.length) {
        for (var i =0; i<tags.length; i++) {
            var str = tags[i];
            if (str.indexOf('#') == 0) {
                str = str.substring(1);
                tags[i] = str;
            }
        }
        properties.tags = tags;
    }
    var point = {
        "type" : "Feature",
        "geometry" : {
            "type" : "Point",
            "coordinates" : coordinates
        },
        "properties" : properties
    };

    return point;
}

function toGeoJson(category, array) {
    var features = [];
    var fields = getFieldsFromHeader(fieldMapping, array[0]);
    for ( var i = 1; i < array.length; i++) {
        var point = toGeoJsonPoint(fields, array[i]);
        point.properties.category = category;
        features.push(point);
    }
    return features;
}



