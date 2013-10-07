define([ 'Underscore', 'yaml', './screens/models/Resource', './screens/commons/Dialog' ],
        
function(_, YAML, Resource, Dialog) {
    'use strict';
    var Utils = {};

    Utils.toStructuredContent = function(attr) {
        // var copy = _.extend({}, attr);
        // deep copy
        var copy = JSON.parse(JSON.stringify(attr));
        var description = copy.properties.description || '';
        delete copy.properties.description;
        copy.properties = _.extend(copy.properties, {geometry: copy.geometry || '', type: copy.type || ''});        
        var dataYaml = YAML.stringify(copy.properties, 4, 2);
        // var text = description + "\n\n----\n" + dataYaml;
        return {yaml:dataYaml, content: description};

    }

    Utils.toJSON = function(description, yaml) {
        description = (description || '').trim();
        var obj = YAML.parse(yaml || '');
        obj.description = description;
        return obj;

    }
    
    Utils.showOkDialog = function(title, message) {
        var dialog = new Dialog({
            title : title,
            content : message,
            actions : [ {
                label : 'Ok',
                primary : true,
                action : function() {
                    dialog.hide();
                }
            } ]
        });
        dialog.show();
        return dialog;
    }
    
    Utils.showYesNoDialog = function(title, message, yesCallback, noCallback) {
        var dialog = new Dialog({
            title : title,
            content : message,
            actions : [ {
                label : 'Oui',
                primary : true,
                action : yesCallback
            }, {
                label : 'Non',
                action : noCallback 
            } ]
        });
        dialog.show();
        return dialog;
    }
    
    
    // TODO: externalize this script and these mappings
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
            'Url page Viadeo' : 'viadeo',
            'Catégorie' : 'category'
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
        str = str.replace(/[\s,;\\/]+/gi, '-');
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
        
        // var id = buildId(properties.url);
        var id = buildId(properties.name);
        properties.id = id;
        var coordinates = [ parseFloat(removeProp('lng'))||0, parseFloat(removeProp('lat'))||0 ];
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
        
        if (properties && properties.category) {
            properties.category = Resource.mapCategory(properties.category) || properties.category;
        }
        
        var point = {
            type : "Feature",
            geometry : {
                type : "Point",
                coordinates : coordinates
            },
            properties : properties
        };

        return point;
    }

    Utils.toGeoJson =  function(array) {
        var features = [];
        var fields = getFieldsFromHeader(fieldMapping, array[0]);
        for ( var i = 1; i < array.length; i++) {
            var point = toGeoJsonPoint(fields, array[i]);
            features.push(point);
        }
        return features;
    }    
    
    Utils.newCodeMirror =  function(elt, options, readOnly, value) {
        options = options || {};
        var defaultOptions = {
            lineNumbers : true,
            viewportMargin : Infinity,
            lineWrapping : true,
            mode : 'text',
            readOnly : readOnly,
            height : '100%'
        };
        options = _.extend(defaultOptions, options);
        var editor = new CodeMirror(elt, options);
        editor.setValue(value);
        return editor;
    }

    return Utils;
});