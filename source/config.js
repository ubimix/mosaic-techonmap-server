var Path = require("path");
var ChildProcess = require('child_process');
var Fs = require("fs");
var program = require('commander');
var Yaml = require('yamljs');
var Tools = require('./tools');

module.exports = (function() {

    program.version('0.4.4').option('-c, --config <path>', 'Specify the config file').option('-#, --hash-string <string>',
            'Create an hash for a string').option('-l, --local', 'Listen on localhost only').option('-s, --sample-config',
            'Dumps a config file template and exits').parse(process.argv);

    if (program.sampleConfig) {
        console.log(sampleConfig());
        process.exit(0);
    }

    if (program.hashString) {
        console.log(Tools.hashify(program.hashString));
        process.exit(0);
    }

    if (!program.config || !Fs.existsSync(program.config)) {
        program.help();
        process.exit(-1);
    }

    var config = Yaml.parse(Fs.readFileSync(program.config).toString());

    if (!config.application || !config.server) {
        console.log("Error: a problem exists in the config file. Cannot continue.");
        process.exit(-1);
    }

    return config;

    // Dumps a sample config file
    function sampleConfig() {
        return "\
---\n\
# Configuration sample file for Jingo (YAML)\n\
application:\n\
    title: \"CartoWiki\"\n\
server:\n\
    hostname: \"localhost\"\n\
    port: 6067\n\
    localOnly: false\n\
    baseUrl: \"http://localhost:6067\"\n\
authentication:\n\
    google:\n\
      enabled: true\n\
	twitter:\n\
	  enabled: true\n\
	  oauthkeys:\n\
        consumerKey : ''\n\
        consumerSecret : ''\n\
      cacheExpire: 3600000\n\
	facebook:\n\
	  enabled: true\n\
	  oauthkeys:\n\
        clientID : ''\n\
        clientSecret : ''\n\
    alone:\n\
      enabled: false\n\
      username: \"\"\n\
      passwordHash: \"\"\n\
      email: \"\"\n\
twitterClient:\n\
    consumerKey : ''\n\
    consumerSecret : ''\n\
    accessTokenKey : ''\n\
    accessTokenSecret : ''\n\
";
    }

})();
