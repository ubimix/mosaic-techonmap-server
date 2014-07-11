var Path = require('path');
var Fs = require('fs');
var _ = require('underscore')._;
var ElasticSearch = require('elasticsearch');
var P = require('when');

var config = require('../config');
var Namer = require('../lib/namer');
var JSCR = require('jscr-api/jscr-api');
var BaasBoxCli = require('../../public/baasbox/baasbox-cli');


var indexName = 'idx2';

var bbox = new BaasBoxCli({
    host : config.baasbox.host,
    username : config.baasbox.username,
    password : config.baasbox.password,
    appcode : config.baasbox.appcode
});


/* ========================================================================== */
/* Data transformation utilities */
/* -------------------------------------------------------------------------- */

/** Updates the given resource with values from the GeoJSON object */
function updateResourceFields(resource, geoJson) {
    _.each([ 'properties', 'geometry' ], function(name) {
        var from = geoJson[name] || {};
        var to = resource[name] = resource[name] || {};
        _.each(from, function(value, key) {
            to[key] = value;
        })
    })
    return resource;
}

/** Copies all required fields from the specified resource */
function getGeoJsonFromResource(resource, showSystemProperties) {
    var id = resource.getPath();
    var coordinates = resource.geometry ? _.clone(resource.geometry.coordinates) : [];
    // console.log(' * ' + id);
    // console.log(JSON.stringify(resource));
    var properties = _.clone(resource.properties);
    var result = {
        id : id,
        type : "Feature",
        geometry : {
            "type" : "Point",
            "coordinates" : coordinates
        },
        properties : properties
    };
    if (showSystemProperties !== false) {
        result.sys = _.clone(resource.sys);
    } else {
        delete result.properties.email;
    }
    return result;
}

/**
 * Detects and returns path of a resource corresponding to the given GeoJSON
 * object
 */
function getPathFromGeoJson(geoJson) {
    var result = geoJson.id;
    if (!result) {
        var properties = geoJson.properties = (geoJson.properties || {});
        if (!result) {
            // FIXME in case of Git, ids need to be normalized
            result = properties.id = (Namer.normalize(properties.id) || Namer.normalize(properties.name));
        }
        if (!result) {
            result = sys.path = (sys.path || Namer.normalize(properties.name));
        }
    }
    result = JSCR.normalizePath(result);
    return result;
}

/* ========================================================================== */
/* HTTP request-response utilities */
/* -------------------------------------------------------------------------- */

/* HttpError wrapper */
function HttpError(code, msg) {
    Error.call(this, msg);
    this.errorCode = code;
}
_.extend(HttpError.prototype, Error.prototype);
HttpError.notFound = function(path) {
    return new HttpError(404, 'Resource "' + path + '" not found.');
}

/** Send the results returned by the given promise. */
function reply(req, res, promise) {
    return promise
    //
    .then(function(result) {
        res.json(result);
        // Return something to avoid blocking
        return true;
    })
    //
    .then(null, function(error) {
        console.log(error);
        if (error instanceof HttpError) {
            res.send(error.message, error.errorCode);
        } else {
            res.json({
                errors : error
            });
        }
        return true;
    });
}

/** Returns resource path from the specified HTTP request */
function getRequestedPath(req) {
    var result = req.params.path || req.params.id || '';
    return JSCR.normalizePath(result);
}

/** Transforms the specified request parameter to a valid version number */
function getVersionFromRequest(req, param) {
    var result = req.params[param];
    result = JSCR.version({
        versionId : result
    });
    return result;
}

/** Loads and returns information about the user from the current request */
function getOptionsFromRequest(req) {
    var options = {};
    var user = req.user;
    if (user) {
        var accountId = user.accountId;
        if (!accountId) {
            accountId = user.displayName;
            accountId = accountId.replace(/[\s]/, '.').toLowerCase();
        }
        var author = user.displayName + ' <' + accountId + '>';
        options.author = author;
    }
    return options;
}

/**
 * Reads JSON object from the request body, parse it and returns the results
 */
function loadJsonFromRequest(req) {
    var data = req.body;
    return P(data);
}

function loadJsonMapFromRequest(req) {
    var data = req.body.data;
    return P(data);
}

/* ========================================================================== */
/* Main application functions */
/* -------------------------------------------------------------------------- */

function indexResource(resource, client) {

    return client.index({
        index : indexName,
        type : 'resource',
        id : resource.getPath(),
        body : {
            name : resource.properties.name,
            relations : resource.properties.relations,
            description : resource.properties.description
        }
    });

}

/** Import an array of GeoJSON items in the specified project */
function importGeoJSON(project, json, options) {
    var items = _.isArray(json.features) ? json.features : _.isArray(json) ? json : [ json ];
    var promise = P();
    var result = {};
    _.each(items, function(item) {
        var itemPath = getPathFromGeoJson(item);
        promise = promise.then(function() {
            return importGeoJSONItem(project, itemPath, item, options)
            //
            .then(function(resource) {
                result[itemPath] = resource;
                return resource;
            });
        });
    })
    return promise.then(function() {
        return result;
    });
}

/**
 * Initializes and returns a new project. The following options fields are used:
 * 
 * <pre>
 * - dir - a root workspace directory
 * - name - a name of the repository
 * </pre>
 */
function initProject(options) {
    return P();
}

/** Binds request handling to the specified application */
function initializeApplication(app, project) {
    function getGeoJsonList(resources, keepSystemProperties) {
        var list = [];
        _.each(resources, function(resource) {
            var path = resource.getPath();
            if (path.indexOf('.') == 0)
                return;
            var json = getGeoJsonFromResource(resource, keepSystemProperties);
            list.push(json)
        });
        return list;
    }


    app.get('/api/resources', function(req, res) {
        var path = getRequestedPath(req);

        bbox.login().then(function() {

            // var criteria = encodeURIComponent('properties.name like
            // \'Under%\'');
            // , 'where='+criteria
            console.log('queryCollection')
            return bbox.queryCollection(config.baasbox.collection, {
                fields : 'properties,id',
                page : 0,
                recordsPerPage : 1000
            }).then(function(data) {
                // console.log(JSON.stringify(result, null, 2));
                res.json(data);
            });

        }).then(null, function(error) {
            res.json({
                error : error.message
            });
        }).done();

    });

    /** Loads and returns all root resources from the storage */
    // /api/jscr-es/resources/export
    app.get('/api/es/resources', function(req, res) {
        var path = getRequestedPath(req);
        var client = new ElasticSearch.Client({
            host : 'localhost:9200',
            log : 'error'
        });

        client.search({
            index : indexName,
            type : 'resource',
            pretty : true,
            size : 100,
            body : {
                query : {
                    match_all : {}
                }
            }
        }).then(function(resp) {
            var hits = resp.hits.hits;
            console.log('**********************' + hits.length);
            // return resp.hits.hits;
            var resources = [];
            _.each(hits, function(hit, index) {
                var resource = {};
                resource.id = hit._id;
                // resource.type = hit._type;
                resource.type = 'Feature';
                resource.properties = {};
                resource.properties.id = hit._id;
                resource.properties.name = hit._source.name;
                resource.sys = {
                    path : hit._id
                };
                resources.push(resource);
            });

            res.json(resources);
        }, function(err) {
            console.log(err);
            // console.trace(err.message);
            res.json({
                error : err.message
            });
        });

    });

    /** Provides search results for autocompletion */
    // [
    // {
    // "value": "Artelys",
    // "tokens": [
    // "Artelys"
    // ],
    // "id": "artelys"
    // },
    // {
    // "value": "A World For Us",
    // "tokens": [
    // "A World For Us"
    // ],
    // "id": "a-world-for-us"
    // },
    // /api/resources/suggest
    app.get('/api/typeahead', function(req, res) {
        var path = getRequestedPath(req);
        var query = req.query.query;
        console.log('typeahead', path);

        bbox.login().then(function() {

            var criteria = encodeURIComponent('properties.name like \'' + query + '%\'');
            return bbox.queryCollection(config.baasbox.collection, {
                where : criteria
            }).then(function(result) {
                var suggestions = [];
                _.each(result.data, function(resource) {
                    suggestions.push({
                        value : resource.properties.name,
                        tokens : [ resource.properties.name ],
                        id : resource.id
                    })
                });

                res.json(suggestions);
            });

        }, function(error) {
            res.json({
                error : error.message
            });
        }).done();

    });

    /** Provides search results for autocompletion */
    // /api/resources/suggest
    app.get('/api/es/typeahead', function(req, res) {
        var path = getRequestedPath(req);
        var query = req.query.query;
        console.log('typeahead', path);

        var client = new ElasticSearch.Client({
            host : 'localhost:9200',
            log : 'error'
        });

        var match = [];

        client.suggest({
            index : indexName,
            body : {
                suggester : {
                    text : query,
                    completion : {
                        size : 20,
                        field : 'suggest'
                    }
                }
            }
        }, function(error, response) {
            console.log('error', error);
            console.log(response);
            var suggestion = response.suggester[0];
            _.each(suggestion.options, function(option) {
                console.log(option.text);
                var name = option.text;
                match.push({
                    value : name,
                    tokens : [ name ],
                    id : name
                });

            });
            res.json(match);

        })

    });

    app.get('/api/resources/search', function(req, res) {
        var path = getRequestedPath(req);
        var query = req.query.query;
        console.log('search', query);

        var client = new ElasticSearch.Client({
            host : 'localhost:9200',
            log : 'error'
        });

        var match = [];

        client.search({
            index : indexName,
            type : 'resource',
            pretty : true,
            size : 100,
            body : {
                query : {
                    match_phrase : {
                        description : query
                    }

                }
            }
        }, function(error, response) {
            console.log('error', error);
            console.log(response);
            var suggestion = response.suggester[0];
            _.each(suggestion.options, function(option) {
                console.log(option.text);
                var name = option.text;
                match.push({
                    value : name,
                    tokens : [ name ],
                    id : name
                });

            });
            res.json(match);

        })

    });

    app.get('/api/resources/index', function(req, res) {
        var path = getRequestedPath(req);
        reply(req, res, project.loadChildResources(path).then(function(results) {
            var promise = P();
            var client = new ElasticSearch.Client({
                host : 'localhost:9200',
                log : 'trace'
            });
            _.each(results, function(resource) {
                console.log('resource', resource.getPath());
                promise = promise.then(function() {
                    // return
                    // project.loadResource(resource.getPath()).then(function(resource)
                    // {
                    return indexResource(resource, client);

                    // });
                });
            });

            return promise.then(function() {
                return [];
            });

        })

        );
    });

    app.get('/api/resources/:path', function(req, res) {
        var path = getRequestedPath(req);
        // reply(req, res, project.loadResource(path).then(function(resource) {
        // if (!resource) {
        // throw HttpError.notFound(path);
        // }
        // return getGeoJsonFromResource(resource);
        // }));

        console.log('path', path);

        
        bbox.login().then(function() {

            return bbox.getResource(config.baasbox.collection, path).then(function(result) {
                console.log(JSON.stringify(result, null, 2));
                res.json(result);
            });

        }, function(error) {
            res.json({
                error : error.message
            });
        }).done();

    });

    /** Import 'in-batch' an array of GeoJSON items */
    app.post('/api/resources/import', function(req, res) {
        reply(req, res, loadJsonMapFromRequest(req).then(function(json) {
            var options = getOptionsFromRequest(req);
            var result = importGeoJSON(project, json, options);
            return result;
        }));
    });

    function saveResource(req, res) {
        reply(req, res, loadJsonFromRequest(req)
        //
        .then(function(json) {
            var path = getRequestedPath(req);
            if (path == '') {
                path = getPathFromGeoJson(json);
            }
            var options = getOptionsFromRequest(req);

            return bbox.login().then(function() {
                return bbox.updateResource(config.baasbox.collection, path, json).then(function(data) {
                    res.json(data);
                });

            });

            // //
            // .then(function(value) {
            // // remove the resource from the validation object
            // var timestampPath = '.admin-timestamp';
            // return project //
            // .loadResource(timestampPath) //
            // .then(function(resource) {
            // // Change it
            // var properties = resource.getProperties();
            // var list = properties.validated || [];
            // properties.validated = _.without(list, path);
            // return project.storeResource(resource, options);
            // }).then(function() {
            // return value;
            // })
            // });
        }));
    }

    app.post('/api/resources/:path', saveResource);
    app.put('/api/resources/:path', saveResource);

    /** Removes a resource with the specified path. */
    app['delete']('/api/resources/:path', function(req, res) {
        var path = getRequestedPath(req);
        var options = getOptionsFromRequest(req);
        reply(req, res, project.deleteResource(path, options).then(function(success) {
            return {
                result : 'OK'
            };
        }));
    });

    /** Returns a list of versions for the specified resource */
    app.get('/api/resources/:path/history', function(req, res) {
        var path = getRequestedPath(req);
        reply(req, res, project.loadResourceHistory(path).then(function(history) {
            if (!history || !history.length) {
                throw HttpError.notFound(path);
            }
            return history;
        }));
    });

    /**
     * Returns resource content for the specified version.
     */
    app.get('/api/resources/:path/history/:version', function(req, res) {
        var path = getRequestedPath(req);
        var version = getVersionFromRequest(req, 'version');
        reply(req, res, project.loadResourceRevisions(path, {
            versions : [ version ]
        }).then(function(revisions) {
            if (!revisions || !revisions.length) {
                throw HttpError.notFound(path);
            }
            return getGeoJsonList(revisions, true);
        }));
    });

    app.get('/api/resources/:path/binaries', function(req, res) {
        var path = getRequestedPath(req);
        var repository = config.repository;
        var filePath = Path.join(repository.rootDir, repository.name, path);
        if (Fs.existsSync(filePath)) {
            var binaries = Fs.readdirSync(filePath);
            res.json({
                binaries : binaries
            });
        } else {
            res.json({
                binaries : []
            });

        }
    });

    app.get('/api/resources/:path/relations', function(req, res) {
        var path = getRequestedPath(req);
        var repository = config.repository;

        var client = new ElasticSearch.Client({
            host : 'localhost:9200',
            log : 'trace'
        });

        client.search({
            index : indexName,
            type : 'resource',
            pretty : true,
            size : 1000,
            body : {
                query : {
                    nested : {
                        path : "relations",
                        score_mode : "avg",
                        query : {
                            match_phrase : {
                                id : path
                            }
                        }
                    }
                }
            }
        }).then(function(resp) {
            var hits = resp.hits.hits;
            var relations = [];
            _.each(hits, function(hit) {
                relations.push({
                    id : hit._id
                });
            })

            project.loadResource(path).then(function(resource) {
                _.each(resource.properties.relations, function(item) {
                    relations.push(item);
                });
                res.json({
                    relations : relations.sort(function(a, b) {
                        if (a.id > b.id)
                            return 1;
                        if (a.id < b.id)
                            return -1;
                        // a must be equal to b
                        return 0;
                    })
                });

            })

        }, function(err) {
            console.log(err);
            res.json({
                error : err.message
            });
            // console.trace(err.message);
        });

    });

    app.get('/api/resources/:path/:path1', function(req, res) {
        var path = getRequestedPath(req);
        var path1 = req.params.path1;
        var repository = config.repository;
        var filePath = Path.join(repository.rootDir, repository.name, path, path1);
        var img = Fs.readFileSync(filePath);
        res.writeHead(200, {
            'Content-Type' : 'image/jpg'
        });
        res.end(img, 'binary');

    });

    app.get('/api/file/:path', function(req, response) {
        var path = getRequestedPath(req);
        
        bbox.getFile(path).then(function(fileResponse) {
            
            response.writeHead(200, {
                'Content-Type' : fileResponse.headers['content-type'],
                'Content-Length' : fileResponse.headers['content-length'],
                'Content-Disposition' :  fileResponse.headers['content-disposition']
            });
            
            fileResponse.on('data', function(data) {
                response.write(data);
            });
            
            fileResponse.on('end', function() {
                response.end();        
            });
            
        });
        
        

    });

    var VALIDATION_RESOURCE = '.admin-timestamp';
    function updateValidationResource(req, res) {
        reply(req, res, loadJsonFromRequest(req).then(function(json) {
            var options = getOptionsFromRequest(req);
            return importGeoJSONItem(project, VALIDATION_RESOURCE, json, options);
        }));
    }
    app.put('/api/validation', updateValidationResource);
    app.post('/api/validation', updateValidationResource);

    app.get('/api/validation', function(req, res) {
      
        reply(req, res, P({}));
    });

}

/* ========================================================================== */
/* The main exported module (the 'main' function) */
/* -------------------------------------------------------------------------- */
module.exports = function(app) {
    var options = config.repository;
    // Opens and initializes project
    return initProject(options)
    .then(function(project) {
        initializeApplication(app, project);
        return true;
    }, function(err) {
        console.log('error', err);
        throw err;
    });
}
