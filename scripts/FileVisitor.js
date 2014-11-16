var _ = require('underscore');
var Q = require('q');
var FS = require('fs');
var Path = require('path');
module.exports = {
    visit : function visit(file, visitor) {
        return Q.ninvoke(FS, 'stat', file).then(function(stat) {
            var directory = !!stat && stat.isDirectory();
            return Q().then(function() {
                return visitor(file, directory);
            }).then(function(result) {
                if (result === false || !directory)
                    return;
                return Q.ninvoke(FS, 'readdir', file).then(function(list) {
                    return Q.all(_.map(list, function(f) {
                        var child = Path.join(file, f);
                        return visit(child, visitor);
                    }));
                });
            })
        })
    }
}