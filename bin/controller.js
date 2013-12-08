// TODO: Globally replace req/res with this.req/this.res and remove var statements
// TODO: Make postLogin() secure by not hashing immediately

"use strict";
var app = require("./app")
  , views = require("./views")
  , models = require("./models")
  , crypto = require("crypto")
  , key = 'abcdeg';

function showIndex () {
  var req = this.req
    , res = this.res;
  models.getPageObj(req, res, 'index', views.renderView2);
}

// Fetch page via pagename from redis and render template
function showPage(pagename) {
  var req = this.req
    , res = this.res;
  models.getPageObj(req, res, pagename, views.renderView2);
}

function logout () {
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
    models.getAdminObj(req, res, 'adminIndex', null, views.renderView2);
  }
}

function showLogin() {
  var req = this.req
    , res = this.res;
  models.getAdminObj(req, res, 'adminLogin', null, views.renderView2);
}

// Send formdata to redis and test whether username and password are valid
function postLogin () {
  var req = this.req
    , formdata = req.body
    , res = this.res;

  var hash = (crypto.createHmac('sha1', key).update(formdata.password).digest('hex')).toString();
  app.redisClient.get("root",
    function(err, password) {
      if (password && hash === password &&
      formdata.username === "root"){
        req.session.set('auth', formdata.username);
        res.redirect("/admin", 301);
      }
      else {
        res.redirect("/login", 301);
      }
    });
}

function showPasswd() {
  var req = this.req
    , res = this.res;
  if (!req.session.legit) {
    res.redirect("/login", 301);
  }
  else {
    models.getAdminObj(req, res, 'adminPasswd', null, views.renderView2);
  }
}

function postPasswd () {
  var req = this.req
    , res = this.res
    , formdata = req.body;

  if (!req.session.legit) {
    res.redirect("/login", 301);
  }
  else {
    if (formdata.password === formdata.passwordrepeat){
      var hash = (crypto.createHmac('sha1', key).update(formdata.password).digest('hex')).toString();
      app.redisClient.set("root", hash,
        function(err) {
          res.redirect("/admin", 301);
        });
    }
    else {
      res.redirect("/admin/passwd", 301);
    }
  }
}

// Show create form
function showCreate() {
  var req = this.req
    , res = this.res;
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    models.getAdminObj(req, res, 'adminCreate', null, views.renderView2);
  }
}

// Show create form with old data
function updateCreate(pagename) {
  var req = this.req
    , res = this.res;
    // , blueprint = ["adminbasis", { partial: 'admincreate',
    //                                attribute: 'id',
    //                                destination: 'admincontent'
    //                              }];
  if (!req.session.legit) {
   res.redirect("/login", 301);
  }
  else {
    // models.getRedisHash(req, res, blueprint, pagename);
    models.getAdminObj(req, res, 'adminCreate', pagename, views.renderView2);
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
    console.log(formdata.pagetitle);
    app.redisClient.hmset("page:" + formdata.pagename,
        {"pagetitle": formdata.pagetitle, "pagecontent": formdata.pagecontent},
      function(err) {
        if (err) {console.log(err)};
        res.redirect("/admin/update", 301);
        console.log('yop');
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
module.exports.postPasswd = postPasswd;
module.exports.show404 = show404;
module.exports.showAdmin = showAdmin;
module.exports.showCreate = showCreate;
module.exports.showIndex = showIndex;
module.exports.showLogin = showLogin;
module.exports.showPage = showPage;
module.exports.showPasswd = showPasswd;
module.exports.showUpdate = showUpdate;
module.exports.updateCreate = updateCreate;
