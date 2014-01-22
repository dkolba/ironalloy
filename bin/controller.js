'use strict';
var services = require('./services')
  , views = require('./views')
  , models = require('./models')
  , mappings = require('./mappings')
  , crypto = require('crypto')
  , key = 'abcdeg';

function showIndex () {
  var req = this.req
    , res = this.res;
  models.getPageObj(req, res, 'index', mappings.index, views.renderView);
}

// Fetch page via pagename from redis and render template
function showPage(pagename) {
  var req = this.req
    , res = this.res;
  models.getPageObj(req, res, pagename, mappings.admin, views.renderView);
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
    models.getAdminObj(req, res, 'adminIndex', null, mappings.admin,
      views.renderView);
  }
}

function showLogin() {
  var req = this.req
    , res = this.res;
  models.getAdminObj(req, res, 'adminLogin', null, mappings.admin,
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
    models.getAdminObj(req, res, 'adminPasswd', null, mappings.admin,
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
    models.getAdminObj(req, res, 'adminCreate', null, mappings.admin,
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
    models.getAdminObj(req, res, 'adminCreate', pagename, mappings.admin,
      views.renderView);
  }
}

// Show fragments form of a certain page with old data
function updateComponents(pagename) {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.getAdminComponents(req, res, 'adminFragments', pagename,
      mappings.admin, views.renderView);
  }
}

// Send fragment changes to redis
function postComponents() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.updateComponentItems(req, res);
  }
}

function showCollection() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.getAdminCollection(req, res, 'adminFragments', null,
      mappings.admin, views.renderView);
  }
}

function updateCollection (pagename) {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.getAdminCollection(req, res, 'adminFragments', pagename,
      mappings.admin, views.renderView);
  }
}

// Send fragment changes to redis
function postCollection() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.updateComponentCollection(req, res);
  }
}
// Show a list of all available pages/collections
function showItem() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.getAdminArray(req, res, 'adminList', null, mappings.admin,
      views.renderView);
  }
}

// Show upload form
function showUpload() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.getAdminObj(req, res, 'adminUpload', null, mappings.admin,
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

// Send formdata to redis
function postUpload() {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.upload(req, res);
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

// Delete collection from redis
function deleteCollection(collectionname) {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.removeCollectionItems(req, res, collectionname);
  }
}

// Delete upload from redis and disk
function deleteUpload(uploadname) {
  var req = this.req
    , res = this.res;

  if (!req.session.legit) {
    res.redirect('/login', 301);
  }
  else {
    models.removeUploadItems(req, res, uploadname);
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
  models.getAdminObj(req, res, '404', null, mappings.admin, views.renderView);
}

// Show consistent 500 page
function show500(err, req, res) {
    res.writeHead(500, {"Content-Type": "text/html"});
    res.end("500 - INTERNAL SERVER ERROR \n" + err);
}

module.exports.deletePage = deletePage;
module.exports.deleteCollection = deleteCollection;
module.exports.deleteUpload = deleteUpload;
module.exports.logout = logout;
module.exports.postLogin = postLogin;
module.exports.postUpdate = postUpdate;
module.exports.postPasswd = postPasswd;
module.exports.postComponents = postComponents;
module.exports.postCollection = postCollection;
module.exports.show404 = show404;
module.exports.show500 = show500;
module.exports.showAdmin = showAdmin;
module.exports.showCreate = showCreate;
module.exports.showIndex = showIndex;
module.exports.showLogin = showLogin;
module.exports.showPage = showPage;
module.exports.showPasswd = showPasswd;
module.exports.showItem = showItem;
module.exports.updateCreate = updateCreate;
module.exports.updateComponents = updateComponents;
module.exports.showCollection = showCollection;
module.exports.showUpload = showUpload;
module.exports.updateCollection = updateCollection;
module.exports.postUpload = postUpload;

