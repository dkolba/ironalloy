"use strict"

var http = require("http")
  , fs = require("fs")
  , flatiron = require("flatiron")
  , director = require("director")
  , union = require("union")
  , plates = require("plates")
  , redis = require("redis")
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , app = flatiron.app;

redisClient.auth(process.env.redissecret);

app.use(flatiron.plugins.http);

// Read template from file, render via plates and send response
function gettemplate () {
  var that = this 
  fs.readFile("templates/template.html", "utf8", function (err, data) {
    if(err) throw err;
    var content = { "test": "New Value" }
      , output = plates.bind(data, content); 
    that.res.writeHead(200, { 'Content-Type': 'text/html' });
    that.res.end(output);
    console.log(output);
  });
}

// Define routing table
var routes = {
  '/hello' : {
    '/:test': {
      get: function (test) {redisClient.set("urls", test);
             console.log(test)}
    },
    get: gettemplate
  }
};

// Inject routing table
app.router.mount(routes);

app.start(8080);
console.log('union with director running on 8080');
