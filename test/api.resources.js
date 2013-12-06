var request = require('request');
var _ = require('underscore');
var root = 'http://umxdev.com:8000';
var fixture = require('./geoitem.json');

describe('/api/resources', function() {
    var url, error, response, body;
    // TODO: generate random id
    

    before(function() {

        // _.each(data.features, function(item) {
        // request.post({
        // url : root + '/api/resources/' + item.properties.id,
        // json : true
        // }, function(error, response) {
        // expect(response.statusCode).to.equal(200);
        // });
        // });

    });

    it('export should return GeoJSON objects', function(done) {

        request.get({
            url : root + '/api/resources/export',
            json : true
        }, function(err, response) {
            expect(response.statusCode).to.equal(200);
            expect(response.body.length).to.be.above(1);
            done();
        });

    });

    it('POSTing an object should make it available', function(done) {
        var id = 'alphabeta';
        request.post({
            url : root + '/api/resources/' + id,
            json : true,
            body : fixture
        }, function(err, response) {
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.be.json;
            expect(response.body.sys.path).to.equal(id);
        });

        request.get({
            url : root + '/api/resources/' + id,
            json : true
        }, function(err, response) {
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.be.json;
            expect(response.body.sys.path).to.equal(id);
            done();

            // FIXME : why is created != updated ?
        });

    });

    it('POSTing an existing object should update its history', function(done) {

        fixture.properties.description = 'modified description';
        var id = 'www.123venture.com';
        request.get({
            url : root + '/api/resources/' + id + '/history',
            json : true
        }, function(err, response) {
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.be.json;
            var historyLength = response.body.length;
            expect(historyLength).to.be.greaterThan(0);

            request.post({
                url : root + '/api/resources/' + id,
                json : true,
                body : fixture
            }, function(err, response) {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.json;
                expect(response.body.sys.path).to.equal(id);
                expect(response.body.properties.description).to.equal(fixture.properties.description);

                request.get({
                    url : root + '/api/resources/' + id + '/history',
                    json : true
                }, function(err, response) {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.json;
                    expect(response.body.length).to.equal(historyLength + 1);
                    done();
                });

            });

        });

    });

    it('response to an existing revision request should contain exactly one object', function(done) {
        var id = 'www.123venture.com';
        request.get({
            url : root + '/api/resources/' + id + '/history',
            json : true
        }, function(err, response) {
            var history = response.body;
            var versionIds = _.pluck(history, 'versionId');
            var current = versionIds[versionIds.length - 1];

            request.get({
                url : root + '/api/resources/' + id + '/history/' + current,
                json : true
            }, function(err, response) {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.json;
                // TODO: why is body an array of elements and not a single
                // element
                expect(response.body.length).to.be.equal(1);

                done();
            });

        });

    });

});