"use strict"

var http = require("http")
  , flatiron = require("flatiron")
  , director = require("director")
  , union = require("union")
  , redis = require("redis")
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , app = flatiron.app;

  redisClient.auth(process.env.redissecret);

function helloWorld() {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
    this.res.end('hello world');
}

// define a routing table.
var router = new director.http.Router({
  '/hello': {
    get: helloWorld
  }
});

var server = union.createServer({
  before: [
    function (req, res) {
      var found = router.dispatch(req, res);
        if (!found) {
          res.emit('next');
      }
    }
  ]
});

server.listen(8080);
console.log('union with director running on 8080');
