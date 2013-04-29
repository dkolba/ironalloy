"use strict";

var http = require("http")
  , fs = require("fs")
  , flatiron = require("flatiron")
  , director = require("director")
  , union = require("union")
  , plates = require("plates")
  , redis = require("redis")
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , app = flatiron.app
  , winston = require('winston')
  , redsess = require('redsess')
  , cookies = require('cookies')
  , keygrip = require('keygrip');

var logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'somefile.log' })
      ]
    });

// Connect to redis db
redisClient.auth(process.env.redissecret);

// Use flatiron http server combo (director/union)
app.use(flatiron.plugins.http, {
  onError:show404,
  before: [redSession]
});

// Test whether the incoming request has a valid session and set
// req.session.legit to true/false
function redSession (req, res) {
  var session = new redsess(req, res, {
  cookieName: 's',
  expire: 400, // default = 2 weeks
  client: redisClient, // defaults to RedSess.client
  keys: [ "this is a string key" ] // will be made into a keygrip obj
  });
  req.session = session;
  res.session = session;

  req.session.get('auth', function (er, auth) {
    if (!auth) {
      req.session.legit = false;
      res.emit('next');
    }
    else {
      req.session.legit = true;
      res.emit('next');
    }
  });
}

// Use st as file server
app.use(flatiron.plugins.static, {
  dir : __dirname + '/public',
  url : 'public/'
});

// Read template from file, render via plates and send response
function gettemplate (req, res, template, pagename, redisdata) {
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
      gettemplate(req, res, "base", null, redisdata);
      logger.log('info', redisdata);
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
        console.log("redisdata=" + redisdata);
        gettemplate(req, res, "base", null, redisdata);
      }
    });
}

// Fetch page via pagename from redis and render template
function showAdmin() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect("/login", 301)
    // show404(null, req, res);
  }
  else {
    redisClient.get("admin",
      function(err, redisdata) {
        if(err) throw err;
        if(redisdata===null) {
          show404(err, req, res);
        }
        else {
          console.log("redisdata=" + redisdata);
          gettemplate(req, res, "base", null, redisdata);
        }
      });
  }
}

function showLogin() {
  var req = this.req
    , res = this.res;
  gettemplate(req, res, "login");
}

// Send formdata to redis and test whether username and password are valid
function postLogin () {
  var req = this.req
    , formdata = req.body
    , res = this.res;

  redisClient.get(formdata.username,
    function(err, password) {
      if (password && formdata.password === password){
        console.log(password);
        req.session.set('auth', formdata.username);
      }
      gettemplate(req, res, "base", null, password);
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
        console.log("redisdata=" + redisdata);
        gettemplate(req, res, "create", pagename, redisdata);
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
      gettemplate(req, res, "base", null, redisdata);
      console.log(redisdata);
    });
}

// Send formdata to redis
function postUpdate() {
  var req = this.req
    , formdata = req.body
    , res = this.res;
  redisClient.set(formdata.pagename, formdata.pagecontent,
    function(err, redisdata) {
      console.log(redisdata);
      gettemplate(req, res, "base", null, redisdata);
    });
  redisClient.zadd(["allpages", 0, formdata.pagename],
    function(err, redisdata) {
      console.log(redisdata);
    });
}

// Delete page from redis
function deletePage(pagename) {
  var req = this.req
    , res = this.res;
  redisClient.del(pagename,
    function(err, redisdata) {
      console.log(redisdata);
      gettemplate(req, res, "base", pagename, redisdata);
    });
  redisClient.zrem(["allpages", pagename],
    function(err, redisdata) {
      console.log(redisdata);
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
  '/admin' : {
    get: showAdmin
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
  '/login' : {
    get: showLogin,
    post: postLogin
  },

  '/:pagename' : {
    get: showPage
  }
};
// Inject routing table
app.router.mount(routes);

app.start(8080);
console.log('union with director running on 8080');
