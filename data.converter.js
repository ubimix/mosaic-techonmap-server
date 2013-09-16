//#!/usr/bin/env node

var _ = require('underscore')._;
var Program = require('commander');
var Utils = require('./source/lib/yaml.utils');

Program.version('0.0.1').option('-o, --operation <opname>',
        'execute operation: toyaml, parse').parse(process.argv);

if (Program.operation) {
    if (Program.operation == 'toyaml') {
        Utils.toMarkedownYamlFiles('./data/geoitems.1.json', './data/');
        
    } else if (Program.operation == 'parse') {
        var files = Utils.getFilesByExtension('./data', 'md');
        _.each(files, function(file) {
            var obj = Utils.toGeoJson(file);
        });

    } else {
        console.log('operation %s is unknown', Program.operation);
        process.exit(0);

    }

} else {
    Program.help();
    process.exit(-1);
}
