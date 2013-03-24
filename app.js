"use strict";

var http = require("http")
  , fs = require("fs")
  , flatiron = require("flatiron")
  , director = require("director")
  , union = require("union")
  , plates = require("plates")
  , redis = require("redis")
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , app = flatiron.app;

// Connect to redis db
redisClient.auth(process.env.redissecret);

// Use flatiron http server combo (director/union)
app.use(flatiron.plugins.http, {
  onError:show404
});

// Use st as file server
app.use(flatiron.plugins.static, {
  dir : __dirname + '/public',
  url : 'public/'
});

// Read template from file, render via plates and send response
function gettemplate (req, res, template, redisdata) {
  fs.readFile('templates/' + template + '.html', "utf8", function (err, data) {
    if(err) throw err;
    var content = { "content": redisdata}
      , output = plates.bind(data, content);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(output);
  });
}

// Read template from file, render via plates and send response
function gettemplate2 (req, res, template, pagename, redisdata) {
  fs.readFile('templates/' + template + '.html', "utf8", function (err, data) {
    if(err) throw err;
    var content = { "pagename": pagename,
                    "pagecontent": redisdata}
      , output = plates.bind(data, content);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(output);
  });
}


// render '/' http request (root)
function showIndex() {
  var req = this.req
    , res = this.res;
  redisClient.get("root",
    function(err, redisdata) {
      if(err) throw err;
      gettemplate(req, res, "base", redisdata);
      console.log(redisdata);
    });
}

// Fetch page via pagename from redis and render template
function showPage(pagename) {
  var req = this.req
    , res = this.res;
  redisClient.get(pagename,
    function(err, redisdata) {
      if(err) throw err;
      if(redisdata===null) {
        show404(err, req, res);
             }
      else {
        console.log("redisdata=" + redisdata)
        gettemplate(req, res, "base", redisdata);
      }
    });
}

// Show create form
function showCreate() {
  var req = this.req
    , res = this.res;
  gettemplate(req, res, "create");
}

// Show create form with old data
function updateCreate(pagename) {
  var req = this.req
    , res = this.res;
  console.log(pagename);
  redisClient.get(pagename,
    function(err, redisdata) {
      if(err) throw err;
      if(redisdata===null) {
        gettemplate(req, res, "create");
             }
      else {
        console.log("redisdata=" + redisdata)
        gettemplate2(req, res, "create", pagename, redisdata);
      }
    });

}

// Show a list of all available pages
function showUpdate() {
  var req = this.req
    , res = this.res;
  redisClient.zrange("allpages", 0 ,-1 ,
    function(err, redisdata) {
      if(err) throw err;
      gettemplate(req, res, "base", redisdata);
      console.log(redisdata);
    });
}


// Send formdata to redis
function postUpdate() {
  var req = this.req
    , formdata = req.body;
  redisClient.set(formdata.pagename, formdata.pagecontent,
    function(err, reply) {
      console.log(reply);
    });
  redisClient.zadd(["allpages", 0, formdata.pagename],
    function(err, reply) {
      console.log(reply);
    });
}

// Delete page from redis
function deletePage(pagename) {
  redisClient.del(pagename,
    function(err, reply) {
      console.log(reply);
    });
  redisClient.zrem(["allpages", pagename],
    function(err, reply) {
      console.log(reply);
    });

}

// Show consistent 404 page
function show404(err, req, res) {
    //Check whether show404 was called directly via director or another function
    //and adjust req/res 
    if (res) {
      var res = res
        , req = req;
    }
    else {
      var res = this.res
        , req = this.req 
    }
    res.writeHead(404, { 'Content-Type': 'text/text' });
    res.end("This is not the page you are looking for");
    console.log("This is not the page you are looking for");
}

// Define routing table
var routes = {
  '/' : {
    get: showIndex
  },
  '/create' : {
    get: showCreate
  },
  '/delete' : {
    '/:pagename' : {
      get: deletePage
    },
    get: show404
  },
  '/update' : {
    '/:pagename': {
      get: updateCreate
    },
    get: showUpdate,
    post: postUpdate
  },
  '/:pagename' : {
    get: showPage
  }
};
// Inject routing table
app.router.mount(routes);

app.start(8080);
console.log('union with director running on 8080');
