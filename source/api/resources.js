var uuid = require('node-uuid');
var Path = require('path');
var Fs = require('fs');
// TODO: when to use relative paths, absolute paths in node ?
var Utils = require('../lib/yaml.utils');
var Namer = require('../lib/namer');
var _ = require('underscore')._;
var UmxApi = require('umx-api');

var resources = function(app) {

    function loadData(inputFile) {
        
        var connection = new UmxApi.Implementation.Memory.WorkspaceConnection({});
        var workspace = connection.newWorkspace();
        var project = workspace.newProject();
        
        function storeResource(project, item) {
            project.loadResource(item.properties.id, {create: true}, function (error, resource) {
                if (error)
                    throw error;
                resource.properties = item.properties;
                resource.type = item.type;
                resource.geometry = item.geometry;
                project.storeResource(resource, {}, function(error, entry) {
                   if (error)
                       throw error;
// project.loadResourceHistory(item.properties.id,  {}, function (error,
// history) {
// console.log(item.properties.id + ' history: ', history);
// });
                    });
            });
        }
        
        var fileName = Path.basename(inputFile);
        var content = Fs.readFileSync(inputFile).toString();
        var items = JSON.parse(content);
        // initialize dates and versions
        _.each(items, function(item) {
            item.system = {};
            item.system.version = uuid.v1();
            item.system.date = Date.now();
            if (!item.properties.id) {
                item.properties.id = Namer.normalize(item.properties.name);
            }
            storeResource(project, item);
        });
        
        return project;
    }
    
    app.get('/api/resources', function(req, res) {
        project.loadChildResources('', {}, function(err, entries) {
            if (err) 
               return handleError(res, err);
            res.json(_.values(entries));
        });
    });
    
    function isNewResource(resource) {
        // TODO: it seems getCreated does not return a Version object but a JSON
        // one
        var created = resource.getCreated().timestamp;
        var updated = resource.getUpdated().timestamp;
        return created == updated;
        
    }
    
    app.post('/api/resources/import', function(req, res) {
        var data = req.body.data;
        var errors = [];
        var created = [];
        var updated = [];
        
        _.each(data, function(entry) {
            // TODO: remove http(s):// in case there is
            var entryId = entry.properties.url;
            project.loadResource(entryId, {create: true}, function (error, resource) {
                if (error)
                    throw error;
                resource.properties = entry.properties;
                resource.type = entry.type;
                resource.geometry = entry.geometry;
                project.storeResource(resource, {}, function(err, entry) {
                    if (err)
                        errors.push[{id:entryId, error: err, resource: entry}];
                    else {
                        if (isNewResource(entry)) {
                            created.push({id: entry.properties.id, name: entry.properties.name});
                        } else {
                            updated.push({id: entry.properties.id, name: entry.properties.name});
                        }
                    }
                });
            });
        });
        
        res.json({errors:errors, created: created, updated: updated});
    });
    
    app.get('/api/resources/export', function(req, res) {
        project.loadChildResources('', {}, function(err, entries) {
            if (err) 
               return handleError(res, err);
            res.json(_.map(entries, function(entry) { delete entry.sys; return entry;}));
        });
    });
    
    app.get('/api/resources/:id', function(req, res) {
        var id = req.params.id;
        var resource = project.loadResource(id, {}, function(error, result) {
            if (error)
                // TODO: is this the proper way ?
                return handleError(res, error);
            res.json(result);
             
        });
    });
    
    app.post('/api/resources/new', function(req, res) {
        var data = req.body;
        var path = data.path;
        var resource = data.resource;
        // TODO: validate input
        console.log('POST: ', data);
        project.loadResource(path, {create: true}, function (err, entry) {
            if (err)
                return handleError(res, err);
            if (!isNewResource(entry)) {
                res.json({error: 'A resource already exists at the given path ("'+path+'").'});
                return;
            }
            entry = _.extend(entry, { properties: resource.properties, type : resource.type, geometry : resource.geometry});
            project.storeResource(entry, {}, function(error, stored) {
                if (error)
                    return handleError(res, error);
                console.log('Path: ', stored.sys.path)
                res.json(stored);
            });
        });
        
    });
    

    // TODO: actually id will be a path (see router.js) -> how to handle it on
    // the server ?
    // TODO: what if multiple concurrent access
    app.put('/api/resources/:id', function(req, res) {
        var id = req.params.id;
        var resource = req.body;
        // TODO: validate resource: in particular, the resource should have a
        // path
        console.log('PUT: ', resource);
        // TODO: ici on peut mettre à jour n'importe quelle ressource en fait,
        // pas spécialement
        // celle ayant l'id de l'URL
        project.storeResource(resource, {}, function (error, result) {
           console.log('Result: ', JSON.stringify(result, null, 2));
           if (error)
              return handleError(res, error);
           res.json(result);    
        });
        
    });
    
    app.delete ("/api/resources/:id", function(req, res) {
        var id = req.params.id;
        project.deleteResource(id, {}, function (error, result) {
            if (error) 
                return handleError(res, error);
            res.json(result);
        });
    });

    app.get('/api/resources/:id/history', function(req, res) {
        var resourceId = req.params.id;
        project.loadResourceHistory(resourceId, {}, function(error, history) {
           if (error)
               return handleError(res, error);
           project.loadResource(resourceId, {}, function (error, resource) {
               if (error)
                   return handleError(res, error);
               res.json({name: resource.properties.name, history: history});
           });
        });
    });
    
    function handleError(res, error) {
        res.json({error : error.toString()});
    }

    function getVersion(req) {
        return UmxApi.version({ versionId: req.params.version });   
    }
    
    app.get('/api/resources/:id/history/:version', function(req, res) {
        var resourceId = req.params.id;
        var version = getVersion(req);
        project.loadResourceRevisions(resourceId, {versions: [version]}, function (error, result) {
           if (error)
               return handleError(res, error);
           // TODO: what it result length ==0 or result undefined
           // TODO: do we handle a copy of the resource, or the actual resource
            // ?
           // delete result[0].sys;
           res.json(result[0]);
        });
    });

    app.get('/api/typeahead', function(req, res) {
       var query = req.query.query;
       var match = [];
       if (!query) {
           res.json({options: match});
           return;
       }
       query = query.toLowerCase();
       
       project.loadChildResources('', {}, function(err, entry) {
           if (err)
               return handleError(res, err);
           
           _.each(_.values(entry), function(item, index) {
               var name = item.properties.name.toLowerCase();
               var idx = name.indexOf(query);
               if (idx==0) {
                   //TypeaheadJS Datum objects https://github.com/twitter/typeahead.js#datum
                   match.push({value: item.properties.name, tokens: [item.properties.name], id: item.properties.id});
               }    
           });
           res.json(match);
       });
    });

    var project = loadData('./data/geoitems.json');
};

module.exports = resources;