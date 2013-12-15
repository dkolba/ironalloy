// TODO: Globally replace req/res with this.req/this.res and remove var statements
// TODO: Make postLogin() secure by not hashing immediately

'use strict';
var services = require('./app')
  , views = require('./views')
  , models = require('./models')
  , mappings = require('./mappings')
  , crypto = require('crypto')
  , key = 'abcdeg';

function showIndex () {
  var req = this.req
    , res = this.res;
  models.getPageObj(req, res, 'index', mappings.base, views.renderView);
}

// Fetch page via pagename from redis and render template
function showPage(pagename) {
  var req = this.req
    , res = this.res;
  models.getPageObj(req, res, pagename, mappings.base, views.renderView);
}

function logout () {
  var req = this.req
    , res = this.res;
  req.session.del('auth', function(err) {
    if(err) throw err;
    res.redirect('/', 301);
  });
}

// Fetch page via pagename from redis and render template
function showAdmin() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
   res.redirect('/login', 301);
  }
  else {
    models.getAdminObj(req, res, 'adminIndex', null, mappings.base,
      views.renderView);
  }
}

function showLogin() {
  var req = this.req
    , res = this.res;
  models.getAdminObj(req, res, 'adminLogin', null, mappings.base,
    views.renderView);
}

// Send formdata to redis and test whether username and password are valid
function postLogin () {
  var req = this.req
    , formdata = req.body
    , res = this.res;

  var hash = (crypto.createHmac('sha1', key)
                    .update(formdata.password)
                    .digest('hex'))
                    .toString();

  // One day this should be handled by a model function.
  services.redisClient.get('root', function(err, password) {
    if (password && hash === password && formdata.username === 'root'){
      req.session.set('auth', formdata.username);
      res.redirect('/admin', 301);
    }
    else {
      res.redirect('/login', 301);
    }
  });
}

function showPasswd() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.getAdminObj(req, res, 'adminPasswd', null, mappings.base,
      views.renderView);
  }
}

function postPasswd () {
  var req = this.req
    , res = this.res
    , formdata = req.body;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    if (formdata.password === formdata.passwordrepeat){
      var hash = (crypto.createHmac('sha1', key)
                        .update(formdata.password)
                        .digest('hex'))
                        .toString();

      models.setPassword(req, res, hash);
    }
    else {
      res.redirect('/admin/passwd', 301);
    }
  }
}

// Show create form
function showCreate() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.getAdminObj(req, res, 'adminCreate', null, mappings.base,
      views.renderView);
  }
}

// Show create form with old data
function updateCreate(pagename) {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.getAdminObj(req, res, 'adminCreate', pagename, mappings.base,
      views.renderView);
  }
}

// Show a list of all available pages
function showUpdate() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.getAdminArray(req, res, 'adminList', null, mappings.base,
      views.renderView);
  }
}

// Send formdata to redis
function postUpdate() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.updatePageItems(req, res);
  }
}

// Delete page from redis
function deletePage(pagename) {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.removePageItems(req, res, pagename);
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
      , req = this.req;
  }

  res.statusCode = 404;
  models.getAdminObj(req, res, '404', null, mappings.base, views.renderView);
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

