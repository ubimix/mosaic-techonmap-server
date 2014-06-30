var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host : 'localhost:9200',
    log : 'trace'
});

client.indices
        .create({
            index : 'idx'
        })
        .then(function(resp) {
            console.log('index created', resp);
        }, function(error) {
            console.log('************', error);
            process.exit(1);

        })
        .then(function() {

            return client.indices.putMapping({
                index : 'idx',
                type : 'resource',
                body : {
                    resource : {
                        properties : {
                            name : {
                                type : "string"
                            },
                            description : {
                                type : "string"
                            },
                            relations : {
                                type : "nested",
                                properties : {
                                    id : {
                                        type : "string"
                                    }
                                }
                            }
                        }
                    }
                }

            });

        })
        .then(
                function(index) {
                    return client
                            .bulk({
                                body : [

                                        {
                                            "create" : {
                                                "_index" : "idx",
                                                "_type" : "resource",
                                                "_id" : "1"
                                            }
                                        },
                                        {
                                            "name" : "Cain Ullah",
                                            "relations" : [ {
                                                "id" : "David Wynn"
                                            }, {
                                                "id" : "Mica Levi"
                                            } ],
                                            "description" : "Cain is a Founder of Red Badger, the non-techy responsible for business operations. He's worked on lots of innovative projects - from prototype to delivery - for some very big brands. He also likes to clog up the Red Badger mailroom with a constant influx of vinyl purchases to add to his ever-increasing collection."
                                        },
                                        {
                                            "create" : {
                                                "_index" : "idx",
                                                "_type" : "resource",
                                                "_id" : "2"
                                            }
                                        },
                                        {
                                            "name" : "David Wynne",
                                            "relations" : [ {
                                                "id" : "Cain Ullah"
                                            }, {
                                                "id" : "David Bowie"
                                            } ],
                                            "description" : "Founder, developer, and lover (not a hater). David has been making stuff work really well for over 14 years, five of those at Microsoft in the UK, USA and around Europe. He has lead teams, introduced agile into organisations and loves the detail. One day David will write a novel. A really long and interesting one."
                                        }

                                ]
                            })

                });
