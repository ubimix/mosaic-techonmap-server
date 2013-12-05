define([ 'Underscore', 'yaml', 'moment', 'CodeMirror', './screens/models/Resource', './screens/commons/Dialog' ],
        
function(_, YAML, Moment, CodeMirror, Resource, Dialog) {
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
    
    Utils.showOkDialog = function(title, message, callback) {
        var dialog = new Dialog({
            title : title,
            content : message,
            actions : [ {
                label : 'Ok',
                primary : true,
                action : function() {
                    dialog.hide();
                    if (callback) {
                        callback();
                    }
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
    Utils.fieldMapping = {
            'Identifiant' : 'id',
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
            'Email' : 'email',
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
        
        // build id only if not already present in properties
        var id = properties.id;
        if (!id) {
            id = buildId(properties.name);
            properties.id = id;
        }
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
        var fields = getFieldsFromHeader(Utils.fieldMapping, array[0]);
        for ( var i = 1; i < array.length; i++) {
            var point = toGeoJsonPoint(fields, array[i]);
            features.push(point);
        }
        return features;
    }    
    
    Utils.newCodeMirror =  function(elt, options, readOnly, value) {
        options = options || {};
        if (readOnly)
            readOnly = 'nocursor';
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
    
    Utils.formatDate = function(timestamp) {
        if (!timestamp)
            return '';
        return moment(timestamp).lang('fr').calendar();
    }
    
    
    Utils.selectFromObject = function(node, path){
        var array = path.split('.');
        var n = node;
        _.each(array, function(segment){
            if (n){
                if (_.isArray(n) && segment.match(/^\d+$/)){
                    segment = parseInt(segment);
                }
                n = n[segment];
            }
        })
        return n;
    }
    
    Utils.updateObject = function(node, path, value){
        var array = path.split('.');
        var n = node;
        var container = n;
        var len = array.length - 1;
        for (var i=0; i<len;i++) {
            var segment = array[i];
            if (_.isArray(n) && segment.match(/^\d+$/)) {
                segment = parseInt(segment);
            }
            container = n[segment];
            if (container == null){
                if (i  < len - 1 && array[i+1].match(/^\d+$/)) {
                    container = [];
                } else {
                    container = {};
                }
                n[segment] = container;
            }
            n = container;
        }
        var result = false;
        var prop = array[len];
        if (container) {
            container[prop] = value;
            result = true;
        }
        return result;
    } 

    return Utils;
});