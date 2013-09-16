var uuid = require('node-uuid');
var Path = require('path');
var Fs = require('fs');
// TODO: when to use relative paths, absolute paths in node ?
var Utils = require('../lib/yaml.utils');
var Namer = require('../lib/namer');
var _ = require('underscore')._;

var resources = function(app) {

    function loadData(inputFile) {
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
        });
        
        return items;

    }
    
    var container;
    var history = [];

    function getResourceIndex(resourceId) {
        // TODO: use underscore
        for ( var i = 0; i < container.length; i++) {
            var itemId = container[i].properties.id;
            if (itemId == resourceId) {
                return i;
            }
        }
        return -1;
    }
    
    function getResourceVersionIndex(resourceId, versionId) {
        // TODO: use underscore
        for ( var i = 0; i < history.length; i++) {
            var itemId = history[i].properties.id;
            if (itemId == resourceId && history[i].system && history[i].system.version == versionId) {
                return i;
            }
        }
        return -1;
    }
    
    
    function archiveResource(index, current) {
        var old = container[index];
        history.push(old);
        
        var version = uuid.v1();
        current.system = current.system || {}; 
        current.system.version = version;
        current.system.date = Date.now();
        // update the container with the current resource
        container[index] = current;
        
    }
    
    app.get('/api/resources', function(req, res) {
      
        res.json(container);
        
    });

    
    app.get('/api/resources/:id', function(req, res) {
        var id = req.params.id;
        var idx = getResourceIndex(id);
        if (idx >= 0) {
            res.json(container[idx]);
        } else {
            res.json({});
        }
    });

    // TODO: actually id will be a path (see router.js) -> how to handle it on
    // the server ?
    // TODO: what if multiple concurrent access
    app.put('/api/resources/:id', function(req, res) {
        var id = req.params.id;
        var resource = req.body;
        console.log('Updating resource: ' + id);
        var idx = getResourceIndex(id);
        if (idx >= 0) {
            // store old resource in history
            archiveResource(idx, resource);
            //send it back with its new version id and date
            res.json(resource);
        } else {
            throw new Error();
        }
    });
    
    app.delete ("/api/resources/:id", function(req, res) {
        var id = req.params.id;
        console.log('Deleting resource: ' + id);
        var idx = getResourceIndex(id);
        if (idx >= 0) {
            history.push(container[idx]);
            container.splice(idx,1);
            res.json({
                message : 'ok'
            });
        } else {
            throw new Error();
        }
    });

    app.get('/api/resources/:id/history', function(req, res) {
        var resourceId = req.params.id;
        var resourceHistory = [];
        // add current resource object to the resourceHistory, then its real
        // history, if any
        var idx = getResourceIndex(resourceId);
        if (idx >=0) {
            resourceHistory.push(container[idx]);
        }
        
        for ( var i = 0; i < history.length; i++) {
            var itemId = history[i].properties.id;
            if (itemId == resourceId) {
                resourceHistory.push(history[i]);
            }
        }
        
        if (resourceHistory.length > 0) {
            res.json(resourceHistory);
        } else {
            throw new Error();
        }
    });
    
    app.get('/api/resources/:id/history/:version', function(req, res) {
        var resourceId = req.params.id;
        var versionId = req.params.version;
        // check first if this is the current version
        var ridx = getResourceIndex(resourceId);
        if (ridx >= 0 && container[ridx].system.version == versionId) {
            res.json(container[ridx]);
            return;
        }  else {
            // then check if the version is found in the history array
            var idx = getResourceVersionIndex(resourceId, versionId);
            if (idx >= 0) {
                res.json(history[idx]);
            } else {
                throw new Error();
            }
        }
    });
    
    container = loadData('./data/geoitems.json');
    //
};

module.exports = resources;