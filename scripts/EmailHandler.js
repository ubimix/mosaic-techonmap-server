var parse = require('csv-parse');
var Fs = require('fs');
var _ = require('underscore');
var Yaml = require('yamljs');

function fileToObject(file) {
    var content = Fs.readFileSync(file, {
        encoding : 'utf8'
    });
    content = content.split('-------');
    var description = content[0].trim();
    var object = yamlToObject(description, content[1]);
    return object;
}

function yamlToObject(description, yaml) {
    var description = (description || '').trim();
    var obj = Yaml.parse(yaml || '');
    if (obj)
        obj.description = description;
    return obj;
}

function toStructuredContent(obj) {
    var copy = JSON.parse(JSON.stringify(obj));
    var description = copy.description || '';
    delete copy.description;
    var dataYaml = Yaml.stringify(copy, 1, 2);
    // var text = description + "\n\n----\n" + dataYaml;
    return {
        yaml : dataYaml,
        content : description
    };
}

function dumpSync(file, data) {
    var str = data.content + '\n\n-------\n\n' + data.yaml;
    Fs.writeFileSync(file, str);

}

var input = Fs.readFileSync('./systematic-emails.1.csv', {
    encoding : 'utf8'
});

parse(input, {
    comment : '#',
    delimiter : ','
}, function(err, output) {
    _.each(output, function(item) {

        var id = item[0];
        var email = item[1];
        var mdFile = '../repository/techonmap/' + id + '/index.md';
        if (!email || email.length == 0)
            return;
        
        Fs.exists(mdFile, function(exists) {
            if (!exists) {
                console.log('Does not exist: ', mdFile);
            } else {
                var object = fileToObject(mdFile);
                if (!object.email) {
                    object.email = email;
                    var structObj = toStructuredContent(object);
                    dumpSync(mdFile, structObj);
                    console.log('MAJ: ', id, email);
                }
            }

        });
    });

});