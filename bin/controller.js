'use strict';
var services = require('./services')
  , views = require('./views')
  , models = require('./models')
  , mappings = require('./mappings')
  , crypto = require('crypto')
  , key = 'abcdeg';

function showIndex () {
  models.getPageObj(this.req, this.res, 'index', mappings.index,
    views.renderView);
}

// Fetch page via pagename from redis and render template
function showPage(pagename) {
  models.getPageObj(this.req, this.res, pagename, mappings.index,
    views.renderView);
}

// Fetch random page from redis and render template
function randomPage() {
  var req = this.req
    , res = this.res;
  services.redisClient.zcard('allpages',
    function(err, pagesum) {
      if (err) return controller.show500(err, req, res);
      var pagenum = Math.floor(Math.random() * pagesum);
      services.redisClient.zrange('allpages', pagenum, pagenum,
        function(err, fluke) {
          if (err) return controller.show500(err, req, res);
          models.getPageObj(req, res, fluke, mappings.index, views.renderView);
      });
  });
}

function logout () {
  var req = this.req
    , res = this.res;
  req.session.del('auth', function(err) {
    if(err) throw err;
    res.setHeader('Cache-Control', 'no-cache, private, no-store,' +
     'must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.redirect('/', 301);
    console.log('ausgeloggt');
  });
}

// Fetch page via pagename from redis and render template
function showAdmin() {
  models.getAdminObj(this.req, this.res, 'adminIndex', null, mappings.admin,
      views.renderView);
}

function showLogin() {
  models.getAdminObj(this.req, this.res, 'adminLogin', null, mappings.admin,
    views.renderView);
}

// Send formdata to redis and test whether username and password are valid
function postLogin () {
  var req = this.req
    , res = this.res
    , postdata = ''
    , toobig = false;

  req.on("data", function(postdataChunk){
    postdata += postdataChunk;
    if(postdata.length > 1000) {
      postdata = "";
      toobig = true;
      res.writeHead(413, {'Content-Type': 'text/plain'});
      res.end();
      req.connection.destroy();
      return;
    }
  });

  req.on("end", function() {
    if(toobig) {return;}
    var hash = (crypto.createHmac('sha1', key)
                      .update(req.body.password)
                      .digest('hex'))
                      .toString();

    // One day this should be handled by a model function.
    services.redisClient.get('root', function(err, password) {
      if (password && hash === password && req.body.username === 'root'){
        req.session.set('auth', req.body.username);
        res.setHeader('Cache-Control', 'no-cache, private, no-store,' +
          'must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.redirect('/admin', 301);
      }
      else {
        res.setHeader('Cache-Control', 'no-cache, private, no-store,' +
          'must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.redirect('/login', 301);
      }
    });
  });

  req.buffer = false;
}

function showPasswd() {
  models.getAdminObj(this.req, this.res, 'adminPasswd', null, mappings.admin,
    views.renderView);
}

function postPasswd () {
  var formdata = this.req.body;

  if (formdata.password === formdata.passwordrepeat){
    var hash = (crypto.createHmac('sha1', key)
                      .update(formdata.password)
                      .digest('hex'))
                      .toString();

    models.setPassword(this.req, this.res, hash);
  }
  else {
    this.res.setHeader('Cache-Control', 'no-cache, private, no-store,' +
      'must-revalidate, max-stale=0, post-check=0, pre-check=0');
    this.res.redirect('/admin/passwd', 301);
  }
}

// Show create form
function showCreate() {
  models.getAdminObj(this.req, this.res, 'adminCreate', null, mappings.admin,
    views.renderView);
}

// Show create form with old data
function updateCreate(pagename) {

  models.getAdminObj(this.req, this.res, 'adminCreate', pagename, mappings.admin,
    views.renderView);
  services.invalidateCache();
}

// Show fragments form of a certain page with old data
function updateComponents(pagename) {
  models.getAdminComponents(this.req, this.res, 'adminFragments', pagename,
    mappings.admin, views.renderView);
  services.invalidateCache();
}

// Send fragment changes to redis
function postComponents() {
  models.updateComponentItems(this.req, this.res);
  services.invalidateCache();
}

function showCollection() {
  models.getAdminCollection(this.req, this.res, 'adminFragments', null,
    mappings.admin, views.renderView);
}

function updateCollection (pagename) {
  models.getAdminCollection(this.req, this.res, 'adminFragments', pagename,
    mappings.admin, views.renderView);
  services.invalidateCache();
}

// Send fragment changes to redis
function postCollection() {
  models.updateComponentCollection(this.req, this.res);
  services.invalidateCache();
}
// Show a list of all available pages/collections
function showItem() {
  models.getAdminArray(this.req, this.res, 'adminList', null, mappings.admin,
    views.renderView);
}

// Show upload form
function showUpload() {
  models.getAdminObj(this.req, this.res, 'adminUpload', null, mappings.admin,
    views.renderView);
}

// Send formdata to redis
function postUpdate() {
  models.updatePageItems(this.req, this.res);
  services.invalidateCache();
}

// Send formdata to redis
function postUpload() {
  models.upload(this.req, this.res);
}

// Delete page from redis
function deletePage(pagename) {
  models.removePageItems(this.req, this.res, pagename);
  services.invalidateCache();
}

// Delete collection from redis
function deleteCollection(collectionname) {
  models.removeCollectionItems(this.req, this.res, collectionname);
  services.invalidateCache();
}

// Delete upload from redis and disk
function deleteUpload(uploadname) {
  models.removeUploadItems(this.req, this.res, uploadname);
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
module.exports.randomPage = randomPage;
module.exports.showPasswd = showPasswd;
module.exports.showItem = showItem;
module.exports.updateCreate = updateCreate;
module.exports.updateComponents = updateComponents;
module.exports.showCollection = showCollection;
module.exports.showUpload = showUpload;
module.exports.updateCollection = updateCollection;
module.exports.postUpload = postUpload;
