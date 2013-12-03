define([ 'jQuery', 'Underscore', './import' ], function($, _, Import) {
    function transformTags(value) {
        if (!value || value == '')
            return null;
        if (value[0] == '#')
            value = value.substring(1);
        return value;
    }
    var CSV_TO_JSON = {
        template : {
            id : '',
            type : 'Feature',
            geometry : {
                type : 'Point',
                coordinates : [ 0, 0 ]
            },
            properties : {}
        },
        mapping : [ {
            from : 'Nom',
            to : 'properties/id',
            transform : function(value) {
                var result = Import.transformNameToId(value);
                return result;
            }
        }, {
            from : 'Catégory',
            to : 'properties/category',
            transform : function(value) {
                if (!value)
                    return '';
                return value.toLowerCase();
            }
        }, {
            from : 'Nom',
            to : 'properties/name'
        }, {
            from : 'Description',
            to : 'properties/description'
        }, {
            from : 'Tag 1',
            to : 'properties/tags/0',
            transform : transformTags
        }, {
            from : 'Tag 2',
            to : 'properties/tags/1',
            transform : transformTags
        }, {
            from : 'Tag 3',
            to : 'properties/tags/2',
            transform : transformTags
        }, {
            from : 'Latitude',
            to : 'geometry/coordinates/0',
            transform : function(value) {
                return parseFloat(value);
            }
        }, {
            from : 'Longitude',
            to : 'geometry/coordinates/1',
            transform : function(value) {
                return parseFloat(value);
            }
        }, {
            from : 'N° et nom de rue',
            to : 'properties/address'
        }, {
            from : 'CP',
            to : 'properties/postcode'
        }, {
            from : 'Ville',
            to : 'properties/city'
        }, {
            from : 'Année de création',
            to : 'properties/creationyear'
        }, {
            from : 'Url site web',
            to : 'properties/url',
            transform : Import.checkUrl
        }, {
            from : 'Nom compte Twitter',
            to : 'properties/twitter'
        }, {
            from : 'Url page Facebook',
            to : 'properties/facebook'
        }, {
            from : 'Url page Google +',
            to : 'properties/googleplus',
            transform : Import.checkUrl
        }, {
            from : 'Url page Linkedin',
            to : 'properties/linkedin',
            transform : Import.checkUrl
        }, {
            from : 'Url page Viadeo',
            to : 'properties/viadeo',
            transform : Import.checkUrl
        } ]
    }
    var JSON_TO_CSV = {
        mapping : [ {
            from : 'properties/id',
            to : 'Identifiant'
        }, {
            from : 'properties/name',
            to : 'Nom'
        }, {
            from : 'Nom',
            to : 'properties/name'
        }, {
            from : 'properties/description',
            to : 'Description'
        }, {
            from : 'properties/tags/0',
            to : 'Tag 1'
        }, {
            from : 'properties/tags/1',
            to : 'Tag 2'
        }, {
            from : 'properties/tags/2',
            to : 'Tag 3'
        }, {
            from : 'geometry/coordinates/0',
            to : 'Latitude'
        }, {
            from : 'geometry/coordinates/1',
            to : 'Longitude'
        }, {
            from : 'properties/address',
            to : 'N° et nom de rue'
        }, {
            from : 'properties/postcode',
            to : 'CP'
        }, {
            from : 'properties/city',
            to : 'Ville'
        }, {
            from : 'properties/creationyear',
            to : 'Année de création'
        }, {
            from : 'properties/url',
            to : 'Url site web'
        }, {
            from : 'properties/email',
            to : 'Email'
        }, {
            from : 'properties/twitter',
            to : 'Nom compte Twitter'
        }, {
            from : 'properties/facebook',
            to : 'Url page Facebook'
        }, {
            from : 'properties/googleplus',
            to : 'Url page Google +'
        }, {
            from : 'properties/linkedin',
            to : 'Url page Linkedin'
        }, {
            from : 'properties/viadeo',
            to : 'Url page Viadeo'
        }, {
            from : 'properties/category',
            to : 'Catégorie'
        } ]
    }
    return {
        JSON_TO_CSV : JSON_TO_CSV,
        CSV_TO_JSON : CSV_TO_JSON
    }
});
