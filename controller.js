"use strict";
var app = require("./app")
  , views = require("./views")
  , models = require("./models");

// render '/' http request (root)
function showIndex() {
  var req = this.req
    , res = this.res
    , blueprint = ["basis", { partial: 'menu',
                              attribute: 'id',
                              destination: 'pagecontent'
                            },
                            { partial: 'sidebar',
                              attribute: 'id',
                              destination: 'menu'
                            }];
  models.getRedisHash(req, res, blueprint, "index");
}

// Fetch page via pagename from redis and render template
function showPage(pagename) {
  var req = this.req
    , res = this.res
    , blueprint = ["basis", { partial: 'menu',
                              attribute: 'id',
                              destination: 'pagecontent'
                            },
                            { partial: 'sidebar',
                              attribute: 'id',
                              destination: 'menu'
                            }];
  models.getRedisHash(req, res, blueprint, pagename);
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
    , res = this.res
    , blueprint = ["adminbasis", { partial: 'admin',
                                   attribute: 'id',
                                   destination: 'admincontent'
                                 }];
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    views.renderView(req, res, blueprint);
  }
}

function showLogin() {
  var req = this.req
    , res = this.res
    , blueprint = ["adminbasis", { partial: 'adminlogin',
                                   attribute: 'id',
                                   destination: 'admincontent'
                                 }];
  views.renderView(req, res, blueprint);
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
        req.session.set('auth', formdata.username);
        res.redirect("/admin", 301);
      }
      else {
        res.redirect("/login", 301);
      }
    });
}

// Show create form
function showCreate() {
  var req = this.req
    , res = this.res
    , blueprint = ["adminbasis", { partial: 'admincreate',
                                   attribute: 'id',
                                   destination: 'admincontent'
                                 }];
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    views.renderView(req, res, blueprint);
  }
}

// Show create form with old data
function updateCreate(pagename) {
  var req = this.req
    , res = this.res
    , blueprint = ["adminbasis", { partial: 'admincreate',
                                   attribute: 'id',
                                   destination: 'admincontent'
                                 }];
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    models.getRedisHash(req, res, blueprint, pagename);
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
    var blueprint = ["adminbasis"];
    models.getRedisSortedSet(req, res, blueprint);
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
    app.redisClient.hmset("page:" + formdata.pagename,
        {"pagetitle": formdata.pagetitle, "pagecontent": formdata.pagecontent},
      function(err) {
        res.redirect("/admin/update", 301);
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
    app.redisClient.hdel("page:" + pagename,
      function(err) {
        res.redirect("/admin/update", 301);
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

    var blueprint = ["basis", { partial: '404',
                       attribute: 'id',
                       destination: 'pagecontent'
                     }];
    res.statusCode = 404;
    views.renderView(req, res, blueprint);
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
