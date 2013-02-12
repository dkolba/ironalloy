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

function showIndex() {
  redisClient.get("root",
    function(err, reply) {
      console.log(reply)
    });
}

function createPage() {
  redisClient.get("root",
    function(err, reply) {
      console.log(reply)
    });
}

function deletePage(pagename) {
  redisClient.del(pagename,
    function(err, reply) {
      console.log(reply)
    });
}

function get404() {
    this.res.writeHead(404, { 'Content-Type': 'text/text' });
    this.res.end("This is not the page you are looking for");
    console.log("This is not the page you are looking for");
  };


// Define routing table
var routes = {
  '/' : {
    get: showIndex
  },
  '/create' : {
    get: createPage
  },
  '/delete' : {
    '/:pagename' : {
      get: deletePage
    },
    get: get404
  },
  '/update' : {
    get: function () {
      console.log("ich will update.html")
    },
    post: function () {
      console.log("ich will ein post-request")
    }
  },
  '/hello' : {
    '/:test': {
      get: function (test) {redisClient.set("urls", test);
             console.log(test)}
    },
    get: gettemplate
  },
  '/:pagename' : {
    get: function (pagename) {
      console.log(pagename)
    }
  }
};
// Inject routing table
app.router.mount(routes);

app.start(8080);
console.log('union with director running on 8080');
