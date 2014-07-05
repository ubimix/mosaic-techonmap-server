var Request = require('superagent');

var url = 'https://gist.github.com/visionmedia/9fff5b23c1bf1791c349/raw/3e588e0c4f762f15538cdaf9882df06b3f5b3db6/works.js';


// Request.get(url, function(err, res) {
// if (err)
// throw err;
// console.log(res.text);
// });


// Request
// .post('/api/pet')
// .send({ name: 'Manny', species: 'cat' })
// .set('X-API-Key', 'foobar')
// .set('Accept', 'application/json')
// .end(function(error, res){
//
// });

Request.post('http://localhost:9000/login')
.send({appcode: '1234567890', username:'arkub', password:'[leliendéfait]'})
.set('Content-Type', 'application/x-www-form-urlencoded')
.end(function(error, res) {
    console.log('error', error)
    console.log(res);
});
