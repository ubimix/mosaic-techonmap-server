#!/usr/bin/env node

var ElasticSearch = require('elasticsearch');
var _ = require('underscore');


var client = new ElasticSearch.Client({
    host : 'localhost:9200',
    log : 'trace'
});


var indexName = 'idx2';

client.search({
        index : indexName,
        type : 'resource',
        pretty : true,
        size : 10000,
        body : {
            query : {
                
                match_all : { }

// match_phrase : {
// description : "noyau de nuit"
//                    
// }

// nested : {
// path : "relations",
// score_mode : "avg",
// query : {
// match_phrase : {
// id : "Film"
// }
// }
// }
            }

        }
}).then(function(resp) {
    var hits = resp.hits.hits;
    console.log('********************** search results: '+hits.length);
    return resp.hits.hits;
}, function(err) {
    console.log('error', err);

    // console.trace(err.message);
}).then(function() {
    
    return client.suggest({
        index: indexName,
        body: {
          suggester: {
            text: 'M',
            completion: {
              field: 'suggest'
            }
          }
        }
        }, function (error, response) {
            console.log('error', error);
            console.log(response);
            _.each(response.suggester, function(suggestion) {
                console.log(suggestion.options[0].text);
            })
            
    })
  
    
});