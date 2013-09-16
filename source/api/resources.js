var uuid = require('node-uuid');
var Path = require('path');
var Fs = require('fs');

var resources = function(app) {

    function loadData(inputFile) {
        var fileName = Path.basename(inputFile);
        var content = Fs.readFileSync(inputFile).toString();
        var items = JSON.parse(content);
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
    
    function getResourceHistoryIndex(resourceId, versionId) {
        // TODO: use underscore
        for ( var i = 0; i < history.length; i++) {
            var itemId = history[i].properties.id;
            if (itemId == resourceId && history[i].version == versionId) {
                return i;
            }
        }
        return -1;
    }
    

    app.get('/api/resources', function(req, res) {
        if (!container)
            container = loadData('./source/data/geoitems.json');
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
    app.put('/api/resources/:id', function(req, res) {
        var id = req.params.id;
        var resource = req.body;
        console.log('Updating resource: ' + id);
        var version = uuid.v1();
        var idx = getResourceIndex(id);
        if (idx >= 0) {
            // store old resource in history
            var oldResource = container[idx];
            oldResource['version'] = version;
            history.push(oldResource);
            // update the container with the current resource
            container[idx] = resource;
            res.json({
                message : 'ok'
            });
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
        if (versionId == '0') {
            var ridx = getResourceIndex(resourceId);
            if (ridx >= 0) {
                res.json(container[ridx]);
                return;
            } else {
                throw new Error();
            }
        }
        var idx = getResourceHistoryIndex(resourceId, versionId);
        if (idx >= 0) {
            res.json(history[idx]);
        } else {
            throw new Error();
        }
    });

};

module.exports = resources;