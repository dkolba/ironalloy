"use strict";
var app = require("./app")
  , views = require("./views")
  , models = require("./models");

// render '/' http request (root)
function showIndex() {
  var req = this.req
    , res = this.res;
  app.redisClient.get("index",
    function(err, redisdata) {
      if(err) throw err;
      views.gettemplate(req, res, "base", null, redisdata);
      app.logger.log('info', redisdata);
    });
}

// Fetch page via pagename from redis and render template
function showPage(pagename) {
  var req = this.req
    , res = this.res
    , blueprint = [{ partial: 'menu',
                     attribute: 'id',
                     destination: 'pagecontent'
                   },
                   { partial: 'sidebar',
                     attribute: 'id',
                     destination: 'menu'
                   }]
  models.getRedisData(req, res, blueprint, pagename);
}


function logout (req, res) {
  var req = this.req
    , res = this.res;
  req.session.del("auth", function(err) {
    if(err) throw err;
    res.redirect("/", 301);
  });
}

// Fetch page via pagename from redis and render template
function showAdmin() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    app.redisClient.get("page:admin",
      function(err, redisdata) {
        if(err) throw err;
        if(redisdata===null) {
          show404(err, req, res);
        }
        else {
          console.log("redisdata=" + redisdata);
          views.gettemplate(req, res, "base", null, redisdata);
        }
      });
  }
}

function showLogin() {
  var req = this.req
    , res = this.res;
  views.gettemplate(req, res, "login");
}

// Send formdata to redis and test whether username and password are valid
function postLogin () {
  var req = this.req
    , formdata = req.body
    , res = this.res;

  app.redisClient.get("root",
    function(err, password) {
      if (password && formdata.password === password &&
      formdata.username === "root"){
        console.log(password);
        req.session.set('auth', formdata.username);
      }
      views.gettemplate(req, res, "base", null, password);
    });
}

// Show create form
function showCreate() {
  var req = this.req
    , res = this.res;
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    views.gettemplate(req, res, "create");
  }
}

// Show create form with old data
function updateCreate(pagename) {
  var req = this.req
    , res = this.res;
  console.log(pagename);
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    app.redisClient.get("page:" + pagename,
      function(err, redisdata) {
        if(err) throw err;
        if(redisdata===null) {
          views.gettemplate(req, res, "create");
               }
        else {
          console.log("redisdata=" + redisdata);
          views.gettemplate(req, res, "create", pagename, redisdata);
        }
      });
  }
}

// Show a list of all available pages
function showUpdate() {
  var req = this.req
    , res = this.res;
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    app.redisClient.zrange("allpages", 0 ,-1 ,
      function(err, redisdata) {
        if(err) throw err;
        views.gettemplate(req, res, "base", null, redisdata);
        console.log(redisdata);
      });
  }
}

// Send formdata to redis
function postUpdate() {
  var req = this.req
    , formdata = req.body
    , res = this.res;
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    app.redisClient.set("page:" + formdata.pagename, formdata.pagecontent,
      function(err, redisdata) {
        console.log(redisdata);
        views.gettemplate(req, res, "base", null, redisdata);
      });
    app.redisClient.zadd(["allpages", 0, formdata.pagename],
      function(err, redisdata) {
        console.log(redisdata);
      });
  }
}

// Delete page from redis
function deletePage(pagename) {
  var req = this.req
    , res = this.res;
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    app.redisClient.del("page:" + pagename,
      function(err, redisdata) {
        console.log(redisdata);
        views.gettemplate(req, res, "base", pagename, redisdata);
      });
    app.redisClient.zrem(["allpages", pagename],
      function(err, redisdata) {
        console.log(redisdata);
      });
  }
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

module.exports.deletePage = deletePage;
module.exports.logout = logout;
module.exports.postLogin = postLogin;
module.exports.postUpdate = postUpdate;
module.exports.show404 = show404;
module.exports.showAdmin = showAdmin;
module.exports.showCreate = showCreate;
module.exports.showIndex = showIndex;
module.exports.showLogin = showLogin;
module.exports.showPage = showPage;
module.exports.showUpdate = showUpdate;
module.exports.updateCreate = updateCreate;
