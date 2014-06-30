var Request = require('request');
var Restler = require('restler');
var Fs = require('fs');

var BBURL = 'http://localhost:9000/';
var APP_CODE = '1234567890';

function createHeaders(session, appCode) {
    return {
        'User-Agent' : 'restler',
        'X-BB-SESSION' : session,
        'X-BAASBOX-APPCODE' : appCode
    }
}

function uploadFile(file, session, appCode) {

    Fs.stat(file, function(err, stats) {
        Restler.post(BBURL + 'file', {
            multipart : true,
            headers : createHeaders(session, appCode),
            data : {
                'filename' : Restler.file(file, null, stats.size, null, "image/jpg")
            }
        }).on('complete', function(data) {
            console.log(data);
        });
    });
}

function listDocuments(collection, session, appCode) {
    Restler.get(BBURL + 'document/' + collection, {
        headers : createHeaders(session, appCode)
    }).on('complete', function(data) {
        console.log(data);
        return data;
    });
}

function createDocument(collection, jsonObject, session, appCode) {
    Restler.post(BBURL + 'document/' + collection, {
        headers : {
            'User-Agent' : 'request',
            'X-BB-SESSION' : session,
            'X-BAASBOX-APPCODE' : APP_CODE,
            'Content-Type' : 'application/json'
        },
        data : JSON.stringify(jsonObject)
    }).on('complete', function(data) {
        console.log(data);
    });
}

Restler.post(BBURL + 'login', {
    data : {
        username : 'arkub',
        password : 'arkub',
        // username : 'jean',
        // password : 'jean',
        appcode : APP_CODE
    }
}).on('complete', function(body) {

    var session = body.data['X-BB-SESSION'];
    var roles = body.data.user.roles;

    listDocuments('commerces', session, APP_CODE);

    // uploadFile('/home/arkub/tmp/Holy_Motors_poster.jpg', session, APP_CODE);

    createDocument('commerces', {
        tags : [ 'a', 'b', 'c' ],
        name : 'Chez Maxims'
    }, session, APP_CODE);

});
