var uuid = require('node-uuid');
var Path = require('path');
var Fs = require('fs');
// TODO: when to use relative paths, absolute paths in node ?
var Utils = require('../lib/yaml.utils');
var Namer = require('../lib/namer');
var _ = require('underscore')._;
var Q = require('q');

var JSCR = require('jscr-api/jscr-api');
require('jscr-api/jscr-memory');

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
    var result = {
        _id : id,
        type : "Feature",
        geometry : {
            "type" : "Point",
            "coordinates" : coordinates
        },
        properties : properties
    };
    if (showSystemProperties !== false) {
        result.sys = _.clone(resource.sys);
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
        result = properties.id = (properties.id || Namer
                .normalize(properties.name));
    }
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
function getVersionIdFromRequest(req, param) {
    var result = req.params[param];
    return JSCR.version({
        versionId : result
    });
}

/** Reads JSON object from the request body, parse it and returns the results */
function loadJsonFromRequest(req) {
    var data = req.body;
    return Q(data);
}

/* ========================================================================== */
/* Main application functions */
/* -------------------------------------------------------------------------- */

/**
 * Import and stores the given GeoJSON object in the resource with the specified
 * path.
 */
function importGeoJSONItem(project, itemPath, item) {
    return project.loadResource(itemPath, {
        create : true
    }).then(function(resource) {
        resource = updateResourceFields(resource, item);
        return project.storeResource(resource);
    });
}

/** Import an array of GeoJSON items in the specified project */
function importGeoJSON(project, json) {
    var items = _.isArray(json.features) ? json.features
            : _.isArray(json) ? json : [ json ];
    return Q.all(_.map(items, function(item) {
        var itemPath = getPathFromGeoJson(item);
        return importGeoJSONItem(project, itemPath, item);
    }));
}

/**
 * Initializes and returns a new project. This method uses the specified data
 * file to import it in the repository
 * 
 * @param inputFile
 *            data file to import in the repository
 * @returns a promise for an initialized project
 */
function loadData(inputFile) {
    var connection = new JSCR.Implementation.Memory.WorkspaceConnection({});
    var projectName = 'djingo'
    var project = null;

    return connection.connect()
    // Create a project
    .then(function(workspace) {
        return workspace.loadProject(projectName, {
            create : true
        });
    })
    // Set the newly created project in a variable
    .then(function(p) {
        project = p;
    })
    // Load file with data
    .then(function() {
        return Q.nfcall(Fs.readFile, inputFile, 'UTF-8');
    })
    // Parse JSON
    .then(function(data) {
        var json = JSON.parse(data);
        var jsonItems = _.isArray(json.features) ? json.features : json;
        return jsonItems;
    })
    // Store the JSON content as project resources
    .then(function(json) {
        return importGeoJSON(project, json);
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

    /** Loads and returns all root resources from the storage */
    app.get('/api/resources', function(req, res) {
        var path = getRequestedPath(req);
        reply(req, res, project.loadChildResources(path).then(
                function(results) {
                    return _.map(results, function(resource) {
                        return getGeoJsonFromResource(resource);
                    })
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
                    return _.map(results, function(resource) {
                        return getGeoJsonFromResource(resource, false);
                    })
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
        reply(req, res, loadJsonFromRequest(req).then(function(json) {
            return importGeoJSON(project, json);
        }));
    });

    /** Stores a new resource in the repository */
    function saveResource(req, res) {
        reply(req, res, loadJsonFromRequest(req).then(
                function(json) {
                    var path = getRequestedPath(req);
                    if (path == '') {
                        path = getPathFromGeoJson(json);
                    }
                    console.log('Try to save the following resource "' + path
                            + '": ', json)
                    return importGeoJSONItem(project, path, json);
                }));
    }
    app.post('/api/resources/:path', saveResource);
    app.put('/api/resources/:path', saveResource);

    /** Removes a resource with the specified path. */
    app['delete']('/api/resources/:path', function(req, res) {
        var path = getRequestedPath(req);
        reply(req, res, project.deleteResource(path).then(function(success) {
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
        var versionId = getVersionIdFromRequest(req, 'version');
        reply(req, res, project.loadResourceRevisions(path, {
            versions : [ versionId ]
        }).then(function(revisions) {
            if (!revisions || !revisions.length) {
                throw HttpError.notFound(path);
            }
            return _.map(revisions, function(resource) {
                return getGeoJsonFromResource(resource);
            })
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
                var name = item.properties.name.toLowerCase();
                if (!name.match(regexp))
                    return;
                match.push({
                    name : item.properties.name,
                    id : item.properties.id
                });
            });
            return match;
        })
        // Returns the final results to the client
        .then(function(match) {
            return {
                options : match
            }
        }));
    });
}

/* ========================================================================== */
/* The main exported module (the 'main' function) */
/* -------------------------------------------------------------------------- */
module.exports = function(app) {
    return loadData('./data/geoitems.json')
    //
    .then(function(project) {
        initializeApplication(app, project);
        return true;
    });
}
