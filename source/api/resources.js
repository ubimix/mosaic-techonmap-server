var Path = require('path');
var Fs = require('fs');
var config = require('../config');
// TODO: when to use relative paths, absolute paths in node ?
var Namer = require('../lib/namer');
var _ = require('underscore')._;

var Q = require('q');

var Twitter = require('../lib/twitterlib');
var JSCR = require('jscr-api/jscr-api');
require('jscr-api/jscr-memory');
require('jscr-git/jscr-git');

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
    var coordinates = resource.geometry ? _
            .clone(resource.geometry.coordinates) : [];
    // console.log(' * ' + id);
    // console.log(JSON.stringify(resource));
    var properties = _.clone(resource.properties);
    var updated = resource.sys.updated || resource.sys.created;
    properties.updated = updated.timestamp;
    
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
            result = properties.id = (Namer.normalize(properties.id) || Namer
                    .normalize(properties.name));
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
    .fail(function(error) {
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
    return Q(data);
}

function loadJsonMapFromRequest(req) {
    var data = req.body.data;
    return Q(data);
}

/* ========================================================================== */
/* Main application functions */
/* -------------------------------------------------------------------------- */

/**
 * Import and stores the given GeoJSON object in the resource with the specified
 * path.
 */
function importGeoJSONItem(project, itemPath, item, options) {
    console.log('* Import "' + itemPath + '".');
    return project.loadResource(itemPath, {
        create : true
    }).then(function(resource) {
        resource = updateResourceFields(resource, item);
        return project.storeResource(resource, options);
    }).fail(function(error) {
        console.log('***', itemPath, error, item);
        return null;
    });
}

/** Import an array of GeoJSON items in the specified project */
function importGeoJSON(project, json, options) {
    var items = _.isArray(json.features) ? json.features
            : _.isArray(json) ? json : [ json ];
    var promise = Q();
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
    // var connection = new
    // JSCR.Implementation.Memory.WorkspaceConnection(options);
    var connection = new JSCR.Implementation.Git.WorkspaceConnection(options);
    return connection.connect()
    // Create a project
    .then(function(workspace) {
        return workspace.loadProject(options.name, {
            create : true
        });
    })
}

/**
 * Loads data in the specified project. This method returns a promise for the
 * given project. If the input file is not specified then this method just
 * returns the project promise. Used options fields:
 * 
 * <pre>
 * - dir - a root workspace directory
 * - name - a name of the repository
 * - inputFile - a data file to inject in the repository
 * </pre>
 * 
 * @returns a promise for an initialized project
 */
function loadData(project, options) {
    if (!options.inputFile || options.inputFile == ''
            || !Fs.existsSync(options.inputFile))
        return Q(project);
    return Q()
    // Load file with data
    .then(function() {
        return Q.nfcall(Fs.readFile, options.inputFile, 'UTF-8');
    })
    // Parse JSON and return an array of GeoJson objects
    .then(function(data) {
        var json = JSON.parse(data);
        var jsonItems = json.features || json;
        if (!_.isArray(jsonItems)) {
            jsonItems = [ jsonItems ];
        }
        return jsonItems;
    })
    // Store the JSON content as project resources
    .then(function(json) {
        return importGeoJSON(project, json, options);
    })
    // Shows imported resources. Just in case...
    .then(function(resource) {
        // console.log('Stored:', JSON.stringify(resource, null, 2));
        return true;
    })
    // Return the project for the next operations
    .then(function() {
        return project;
    });
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

    /** Loads and returns all root resources from the storage */
    app.get('/api/resources', function(req, res) {
        var path = getRequestedPath(req);
        reply(req, res, project.loadChildResources(path).then(
                function(results) {
                    return getGeoJsonList(results, true);
                }));
    });

    /**
     * Loads and returns all resources in the 'exporing' format (without system
     * properties)
     */
    app.get('/api/resources/export', function(req, res) {
        var path = getRequestedPath(req);
        reply(req, res, project.loadChildResources(path).then(
                function(results) {
                    var list = getGeoJsonList(results, false);
		    var geoJson = {'type':'FeatureCollection','features':list};
		    return geoJson;
                }));
    });

    /** Returns individual resource by its path */
    app.get('/api/resources/:path', function(req, res) {
        var path = getRequestedPath(req);
        reply(req, res, project.loadResource(path).then(function(resource) {
            if (!resource) {
                throw HttpError.notFound(path);
            }
            return getGeoJsonFromResource(resource);
        }));
    });

    /** Import 'in-batch' an array of GeoJSON items */
    app.post('/api/resources/import', function(req, res) {
        reply(req, res, loadJsonMapFromRequest(req).then(function(json) {
            var options = getOptionsFromRequest(req);
            var result = importGeoJSON(project, json, options);
            return result;
        }));
    });

    /** Stores a new resource in the repository */
    function saveResource(req, res) {
        reply(req, res, loadJsonFromRequest(req)
        //
        .then(function(json) {
            var path = getRequestedPath(req);
            if (path == '') {
                path = getPathFromGeoJson(json);
            }
            var options = getOptionsFromRequest(req);
            return importGeoJSONItem(project, path, json, options)
            //
            .then(function(value) {
                // remove the resource from the validation object
                var timestampPath = '.admin-timestamp';
                return project //
                .loadResource(timestampPath) //
                .then(function(resource) {
                    // Change it
                    var properties = resource.getProperties();
                    var list = properties.validated || [];
                    properties.validated = _.without(list, path);
                    return project.storeResource(resource, options);
                }).then(function() {
                    return value;
                })
            });
        }));
    }
    app.post('/api/resources/:path', saveResource);
    app.put('/api/resources/:path', saveResource);

    /** Removes a resource with the specified path. */
    app['delete']('/api/resources/:path', function(req, res) {
        var path = getRequestedPath(req);
        var options = getOptionsFromRequest(req);
        reply(req, res, project.deleteResource(path, options).then(
                function(success) {
                    return {
                        result : 'OK'
                    };
                }));
    });

    /** Returns a list of versions for the specified resource */
    app.get('/api/resources/:path/history', function(req, res) {
        var path = getRequestedPath(req);
        reply(req, res, project.loadResourceHistory(path).then(
                function(history) {
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

    /* --------------------------------------------------------------- */

    /** Provides search results for autocompletion */
    app.get('/api/typeahead', function(req, res) {
        var path = getRequestedPath(req);
        reply(req, res, project.loadChildResources(path)
        // Filter resources
        .then(function(results) {
            var query = req.query.query;
            var match = [];
            if (!query)
                return match;
            query = query.toLowerCase();
            var regexp = new RegExp('\\b' + query, 'gi');
            _.each(results, function(item) {
                if (!item.properties || !item.properties.name)
                    return;
                var name = item.properties.name.toLowerCase();
                if (!name.match(regexp))
                    return;
                // https://github.com/twitter/typeahead.js#datum
                match.push({
                    value : item.properties.name,
                    tokens : [ item.properties.name ],
                    id : item.properties.id
                });
            });
            return match;
        }));
    });

    var VALIDATION_RESOURCE = '.admin-timestamp';
    function updateValidationResource(req, res) {
        reply(req, res, loadJsonFromRequest(req).then(
                function(json) {
                    var options = getOptionsFromRequest(req);
                    return importGeoJSONItem(project, VALIDATION_RESOURCE,
                            json, options);
                }));
    }
    app.put('/api/validation', updateValidationResource);
    app.post('/api/validation', updateValidationResource);

    app.get('/api/validation', function(req, res) {
        reply(req, res, project.loadResource(VALIDATION_RESOURCE).then(
                function(resource) {
                    var promise;
                    if (!resource) {
                        var options = getOptionsFromRequest(req);
                        promise = importGeoJSONItem(project,
                                VALIDATION_RESOURCE, {
                                    properties : {
                                        validated : [],
                                        timestamp : 0
                                    }
                                }, options);
                    } else {
                        promise = Q(getGeoJsonFromResource(resource));
                    }
                    return promise.then(function(json) {
                        console.log(json);
                        return json;
                    });
                }));
    });

    app.get('/api/twitter/last', function(req, res) {
        var twitt = Twitter.fetchLastTweet('TechOnMap', function(err, data) {
            res.json(data);
        });

    });
}

/* ========================================================================== */
/* The main exported module (the 'main' function) */
/* -------------------------------------------------------------------------- */
module.exports = function(app) {
    var options = config.repository;
    // Opens and initializes project
    return initProject(options)
    // Loads project data
    .then(function(project) {
        return loadData(project, options);
    })
    // Initializes the application with the project
    .then(function(project) {
        initializeApplication(app, project);
        return true;
    })
    // Handle errors
    .fail(function(err) {
        console.log('error', err);
        throw err;
    });
}
