var Fs = require('fs');
var Glob = require('glob');
var Path = require('path');
var Yaml = require('yamljs');
var Namer = require("./namer");
var _ = require('underscore')._;

var utils = {

    isTitle : function(text) {
        return typeof text == 'string' && text.charAt(0) == "#";
    },
    hasTitle : function(content) {
        return typeof content == 'string'
                && this.isTitle(content.split("\n")[0]);
    },

    getTitle : function(content, page) {
        var title = content.split("\n")[0];
        return this.isTitle(title) ? title.substr(1) : page.replace(".md", "");
    },

    getBody : function(content) {
        var pageRows = content.split("\n");
        return this.isTitle(pageRows[0]) ? content.substr(pageRows[0].length)
                : content;
    },

    getParts : function(content, fileName) {
        var titleLine = content.split("\n")[0];
        var title = this.isTitle(titleLine) ? titleLine.substr(1) : fileName
                .replace(".md", "");
        title = title.trim();
        var idx = content.indexOf('----\n');
        var yaml = '';
        var description = '';
        if (idx >= 0) {
            yaml = content.substring(idx + '----\n'.length);
            description = content.substring(titleLine.length, idx).trim();
        }
        return {
            title : title,
            yaml : yaml,
            description : description
        };
    },

    getFilesByExtension : function(input, extension) {
        var isDirectory = Fs.statSync(input).isDirectory();
        var files = [];
        files = files.concat(Glob.sync(input + '/*.' + extension));
        return files;
    },

    toGeoJson : function(inputFile) {
        var fileName = Path.basename(inputFile);
        var content = Fs.readFileSync(inputFile).toString();
        var parts = this.getParts(content, fileName);
        // console.log(parts.yaml);
        var yaml = Yaml.parse(parts.yaml);
        yaml.name = parts.title;
        yaml.description = parts.description;
        var geo = yaml.geo;
        delete yaml.geo;
        // var props = JSON.stringify(YAML.load(input), null, spaces);
        var obj = {
            type : 'Feature',
            geometry : {
                type : 'Point',
                coordinates : geo
            },
            properties : yaml
        };
        return obj;

    },

    toMarkedownYamlFiles : function(inputFile, outputFolder) {
        var jsonStr = Fs.readFileSync(inputFile);
        var that = this;
        _.each(JSON.parse(jsonStr), function(elt) {
            var mdYaml = that.toMarkedownYaml(elt);
            that.toFile(mdYaml.name, mdYaml.content, outputFolder, 'md');
        });

    },

    toMarkedownYaml : function(json) {
        try {
            var props = json.properties;
            var name = props.name;
            delete props.name;
            var description = props.description;
            delete props.description;
            props.geo = [ json.geometry.coordinates[1],
                    json.geometry.coordinates[0] ];
            var yaml = Yaml.stringify(props, 1, 2);
            var mdYaml = '# ' + name + '\n' + description + '\n----\n' + yaml;
            return {
                name : name,
                content : mdYaml
            };

        } catch (e) {
            throw new Error('Unsupported object received: '
                    + JSON.stringify(json));
        }
    },

    toFile : function(title, content, folder, extension) {
        var fileName = Namer.normalize(title) + '.' + extension;
        console.log(title, '-', fileName);
        Fs.writeFileSync(folder + fileName, content);

    }

};

module.exports = utils;
