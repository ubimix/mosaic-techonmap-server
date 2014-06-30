
PUT localhost:9200/animal
PUT localhost:9200/animal/badger/_mapping
{
  "badger": {
    "properties": {
      "name": {"type": "string"},
      "role": {"type": "string"},
      "bio": {"type": "string"}
     }
   }
}

GET localhost:9200/animal/_mapping
PUT localhost:9200/animal/badger/_bulk

data: https://gist.githubusercontent.com/hackjoy/7363370/raw/c1bf7e08b9a9e7d16726d512a768ca14df8b2947/badger_data.json

POST localhost:9200/animal/badger/_search?pretty=true
{"query": {
  "match": {
    "name": "Jon"}
}
}

ajouter l'id dans l'index

PUT localhost:9200/rel1/resource/_mapping
{
  "resource": {
    "properties": {
      "name": {"type": "string"},
      "description": {"type": "string"},
      "relations": {
        "type" : "nested",
        "properties" : {"id": {"type":"string"}}
      }
     }
   }
}


PUT localhost:9200/rel1/resource/_bulk
{ "create" : { "_index" : "rel1", "_type" : "resource", "_id" : "1" } }
{ "name" : "Cain Ullah", "relations": [{"id":"David Wynn"},{"id":"Mica Levi"}], "description": "Cain is a Founder of Red Badger, the non-techy responsible for business operations. He's worked on lots of innovative projects - from prototype to delivery - for some very big brands. He also likes to clog up the Red Badger mailroom with a constant influx of vinyl purchases to add to his ever-increasing collection." }
{ "create" : { "_index" : "rel1", "_type" : "resource", "_id" : "2" } }
{ "name" : "David Wynne",  "relations": [{"id":"Cain Ullah"},{"id":"David Bowie"}], "description": "Founder, developer, and lover (not a hater). David has been making stuff work really well for over 14 years, five of those at Microsoft in the UK, USA and around Europe. He has lead teams, introduced agile into organisations and loves the detail. One day David will write a novel. A really long and interesting one." }



POST localhost:9200/rel1/resource/_search?pretty=true
{
    "query": {
        "match": {
            "name": "David"
        }
    }
}

http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-nested-query.html


{ "query" : {
    "nested" : {
        "path": "relations",
         "score_mode" : "avg",
        "query" : {
            "match_phrase" : {
                "id" : "David Bowie"
            }
        }
    }
  }
}
