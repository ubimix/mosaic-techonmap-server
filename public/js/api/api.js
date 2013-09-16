var options = {};
var adapter = new umx.InMemoryAdapter(options);
// var adapter = new umx.HttpBrowserAdapter(options);
// var adapter = new umx.HttpServerAdapter(options);
// var adapter = new umx.GitAdapter(options);
// var adapter = new umx.HBaseAdapter(options);

// Connection (endpoint): Workspace > Project > Items (with properties)
// GitHub: GitServer > GitRepo > Files
// Eclipse: Workspace > Project > Files
// XWiki: Wiki > Space > Page (one level)
// MediaWiki: ? > Namepspace > Page (one level)
// Postgres: Database > Table > Entry (with cells)

// ----------------------------------------------
// Connect to the workspace. Options depends on the implementations.
adapter.connect({}, function callback(err, workspace) {
    // Do something useful with this workspace
})

// ----------------------------------------------
// Workspace API
workspace.loadProjects(function(err, projects) {
    // Do something with the list of projects
})

workspace.loadProject('myproject', {
    create : true
}, function(err, project) {
    // Use the resource
})

workspace.deleteProject('myproject', {
    force : true,
    destroy : true
}, function(err, result) {
    // result = true|false ?
});
//

// ----------------------------------------------
// Project API
project.loadResource('path/to/resource', {
    create : true
}, function(err, resource) {

})

project.loadResources([ 'path/to/res1', 'path/to/res2' ], {}, function(err, resources) {
    // 'resources' is a map of paths and the corresponding resources
})
project.loadResources('path/prefix', {
    depth : 2
}, function(err, resources) {
    // 'resources' is a map of paths and the corresponding resources
})

project.deleteResource('path/to/res1', {
    force : true
}, function(err, result) {
    // Result: true/false
})

project.storeResource('path/to/res1', resource, {
    force : true
}, function(err, resource) {
    // Result: true/false
})

project.lockResource('path/to/res1', {
    force : true,
    prevLock : lock
}, function(err, lock) {
    // 'lock' is an object with the following fields:
    // - id: 'idLock'
    // - expireTime: 123435
    // - path : 'path/to/res1'
    // - userId: 'JohnSmithId'
})

project.unlockResource(lock, function(err, lock) {
    // 'lock' is an object defining the max timeout of the lock
})

// ----------------------------------------------
// History management

project.loadModifiedResources({
    from : '123215',
    to : '1888888',
    order : 'asc'
}, function(err, resources) {
    // 'resources' is an ordered list of resources
})

project.loadHistory('path/to/res1', {
    from : 1235,
    to : 23423
}, function(err, result) {
    // Result is an object with the following fields:
    // - history : a map of resources { versionId : resource }
    // - count : a total number of versions
    // - firstPos : position of the first element in the history
    // - lastPos : position of the last element in the history
});

// ----------------------------------------------
// Search

project.searchResources({
    query : {
        term : 'Hello',
        sortBy : 'properties.label',
        order : 'asc'
    }
}, function(err, resultSet) {
    // ResultSet is an object with the following fields:
    // - totalNumber - number of found resources
    resultSet.loadNext(function(err, result) {
        // result has the following fields:
        // - hasNext - true/false 
        // - resources is an array of resources
        
    })
})

