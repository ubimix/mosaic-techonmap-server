var Fs = require("fs");
var program = require('commander');
var Yaml = require('yamljs');

module.exports = (function() {

    program.version('0.4.4').option('-c, --config <path>', 'Specify the config file').option('-#, --hash-string <string>',
            'Create an hash for a string').option('-l, --local', 'Listen on localhost only').option('-s, --sample-config',
            'Dumps a config file template and exits').parse(process.argv);


    if (!program.config || !Fs.existsSync(program.config)) {
        program.help();
        process.exit(-1);
    }

    var config = Yaml.parse(Fs.readFileSync(program.config).toString());

    return config;

})();
