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
            
            var resource = project.loadResource(item.properties.id, {create: true}, function (error, resource) {
                if (error) {
                    console.log('Store err: ', error);
                    console.log('Store resource: ', resource);
                    throw new Error();
                } else {
                    resource.properties = _.extend(item.properties, {type: item.type, geometry:item.geometry});
                    project.storeResource(resource, {}, function(error, entry) {
                       if (error)
                           throw new Error();
                    });
                }
            });
        });
        
        return project;
    }
    
    var project;
    
    app.get('/api/resources', function(req, res) {
        project.loadChildResources('', {}, function(err, entry) {
            if (!err) {
                res.json(_.values(entry));
                return;
            } else {
                throw new Error();
            }
        });
    });

    
    app.get('/api/resources/:id', function(req, res) {
        var id = req.params.id;
        var resource = project.loadResource(id, {}, function(error, result) {
            if (!error) {
                res.json(result);
                return;
            } else {
                throw new Error();
            }
        });
    });

    // TODO: actually id will be a path (see router.js) -> how to handle it on
    // the server ?
    // TODO: what if multiple concurrent access
    app.put('/api/resources/:id', function(req, res) {
        var id = req.params.id;
        var resource = req.body;
        console.log('Resource: ', resource);
        // TODO: ici on peut mettre à jour n'importe quelle ressource en fait,
        // pas spécialement
        // celle ayant l'id de l'URL
        project.storeResource(resource, {}, function (error, result) {
           console.log('Result: ', JSON.stringify(result, null, 2));
           if (error) {
               throw new Error();
           } else {
               res.json(result);    
           }
        });
        
    });
    
    app.delete ("/api/resources/:id", function(req, res) {
        var id = req.params.id;
        project.deleteResource(id, {}, function (error, result) {
            if (error) {
                throw new Error();
            } else {
                res.json(result);
            }
        });
    });

    app.get('/api/resources/:id/history', function(req, res) {
        var resourceId = req.params.id;
        project.loadResourceHistory(resourceId, {}, function(error, result) {
           if (error)
               throw new Error();
           else {
               project.loadResource(resourceId, {}, function (error, resource) {
                   if (error)
                       throw new Error();
                   
                   res.json({name: resource.properties.name, history: result});
               });
           }
        });
    });
    
    app.get('/api/resources/:id/history/:version', function(req, res) {
        var resourceId = req.params.id;
        var versionId = req.params.version;
        project.loadResourceRevisions(resourceId, {versions: [versionId]}, function (error, result) {
           if (error)
               throw new Error();
           else {
               res.json(result);
           }
        });
    });
    

    app.get('/api/typeahead', function(req, res) {
       console.log('Request params: ', req.query);
       var query = req.query.query;
       var match = [];
       if (!query) {
           res.json({options: match});
           return;
       }
       query = query.toLowerCase();
       
       project.loadChildResources('', {}, function(err, entry) {
           if (err)
               throw new Error();
           
           _.each(_.values(entry), function(item, index) {
               var name = item.properties.name.toLowerCase();
               var idx = name.indexOf(query);
               if (idx==0) {
                   match.push({name: item.properties.name, id: item.properties.id});
               }    
           });
           res.json(match);
       });
       
    });
    
    project = loadData('./data/geoitems.json');
    //
};

module.exports = resources;