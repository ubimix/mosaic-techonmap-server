require([ 'require.config' ], function() {
    require([ 'jQuery', 'Underscore', 'P', 'import' ],
    //
    function($, _, P, Import) {

        function doLoad(url, type, method) {
            if (_.isArray(url)) {
                return P.all(_.map(url, function(u) {
                    return method(u);
                }))
            }
            var deferred = P.defer();
            $.ajax({
                dataType : type,
                url : url,
                success : deferred.resolve,
                error : deferred.reject
            });
            return deferred.promise;
        }

        /** Loads a text file and returns a promise for the content */
        function loadText(url) {
            return doLoad(url, 'text', loadText);
        }

        /** Loads JSON file and returns a promise for this file */
        function loadJSON(url) {
            return doLoad(url, 'json', loadJSON);
        }

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
                to : 'properties/url'
            }, {
                from : 'Nom compte Twitter',
                to : 'properties/twitter'
            }, {
                from : 'Url page Facebook',
                to : 'properties/facebook'
            }, {
                from : 'Url page Google +',
                to : 'properties/googleplus'
            }, {
                from : 'Url page Linkedin',
                to : 'properties/linkedin'
            }, {
                from : 'Url page Viadeo',
                to : 'properties/viadeo'
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
        var jsonURLs = [ './data/data-clean.json', './data/data-dirty.json' ];
        var csvURLs = {
            'ENTREPRISES' : './data/1-ENTREPRISES ok - Feuil1.csv',
            'TIERSLIEUX' : './data/2-TIERSLIEUX ok - Feuil1.csv',
            'INCUBATEURS' : './data/3-INCUBATEURS ok - Feuil1.csv',
            'INVESTISSEURS' : './data/4-INVESTISSEURS ok - Feuil1.csv',
            'COMMUNAUTES' : './data/5-COMMUNAUTES ok - Feuil1.csv',
            'PRESTATAIRES' : './data/6-PRESTATAIRES ok - Feuil1.csv',
            'ECOLES' : './data/7-ECOLES ok - Feuil1.csv',
            'ACTEURSPUBLICS' : './data/8-ACTEURSPUBLICS ok - Feuil1.csv'
        };
        var csvKeys = _.keys(csvURLs);
        var objectList = [];

        P()
        // Load JSON data files
        .then(function() {
            return loadJSON(jsonURLs);
        })
        // Merge all objects in one list
        .then(function(data) {
            // Move all objects in one list
            _.each(data, function(d) {
                objectList = objectList.concat(d);
            })
        })
        // Load text files and convert them to an JSON
        // object
        .then(function() {
            var urls = _.map(csvKeys, function(key) {
                return csvURLs[key];
            })
            return loadText(urls);
        })
        //
        .then(function(array) {
            var i = 0;
            _.each(array, function(data) {
                var key = csvKeys[i++];
                var objects = Import.convertCsvToJson(data);
                var objTemplate = JSON.stringify(CSV_TO_JSON.template);
                _.each(objects, function(object) {
                    object['Catégory'] = key;
                    var result = JSON.parse(objTemplate);
                    _.each(CSV_TO_JSON.mapping, function(m) {
                        var value = Import.selectFromObject(object, m.from);
                        if (m.transform) {
                            value = m.transform(value, result);
                        }
                        var path = m.to || 'properties/' + m.from;
                        Import.updateObject(result, path, value);
                    })
                    objectList.push(result);
                })
            })
        })

        // (!) De-duplicate objects by merging data
        .then(
                function() {
                    var result = Import.mergeJson(objectList, function(obj) {
                        var id = obj.properties.id || obj.id;
                        var generatedId = Import
                                .transformNameToId(obj.properties.name);
                        if (id != generatedId) {
                            // FIXME:
                            id = generatedId; // Import.transformNameToId(obj.properties.name);
                            obj.properties.id = generatedId;
                        }
                        return id;
                    })
                    return result;
                })
        // Sort objects by name and remove inused fields
        .then(function(data) {
            data.sort(function(first, second) {
                var a = first.properties.name || '';
                var b = second.properties.name || '';
                a = a.toLowerCase();
                b = b.toLowerCase();
                return a > b ? 1 : a < b ? -1 : 0;
            })
            _.each(data, function(obj) {
                delete obj._id;
                delete obj.id;
                // FIXME:
                var id = obj.id;
                // obj.properties.id = id;
            })
            return data;
        })
        // Serialize objects
        .then(function(data) {
            var str = Import.convertJsonToCsv(data, JSON_TO_CSV.mapping);
            console.log(str);
        })
        //
        .done();

    });
})
