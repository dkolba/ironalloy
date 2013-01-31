"use strict"

var http = require("http")
  , flatiron = require("flatiron")
  , director = require("director")
  , union = require("union")
  , redis = require("redis")
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , app = flatiron.app;

redisClient.auth(process.env.redissecret);

app.use(flatiron.plugins.http);

function helloWorld() {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end('hello world');
};

// define routing table
var routes = {
  '/hello' : {
    '/:test': {
      get: function (test) {redisClient.set("urls", test);
             console.log(test)}
    },
    get: helloWorld
  }
};

// inject routing table
app.router.mount(routes);

app.start(8080);
console.log('union with director running on 8080');
