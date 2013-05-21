var app = require("./app");

// render '/' http request (root)
function showIndex() {
  var req = this.req
    , res = this.res;
  app.redisClient.get("root",
    function(err, redisdata) {
      if(err) throw err;
      app.gettemplate(req, res, "base", null, redisdata);
      app.logger.log('info', redisdata);
    });
}

// Fetch page via pagename from redis and render template
function showPage(pagename) {
  var req = this.req
    , res = this.res;
  app.redisClient.get(pagename,
    function(err, redisdata) {
      if(err) throw err;
      if(redisdata===null) {
        show404(err, req, res);
             }
      else {
        console.log("redisdata=" + redisdata);
        app.gettemplate(req, res, "base", null, redisdata);
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
    app.redisClient.get("admin",
      function(err, redisdata) {
        if(err) throw err;
        if(redisdata===null) {
          show404(err, req, res);
        }
        else {
          console.log("redisdata=" + redisdata);
          app.gettemplate(req, res, "base", null, redisdata);
        }
      });
  }
}

function showLogin() {
  var req = this.req
    , res = this.res;
  app.gettemplate(req, res, "login");
}

// Send formdata to redis and test whether username and password are valid
function postLogin () {
  var req = this.req
    , formdata = req.body
    , res = this.res;

  app.redisClient.get(formdata.username,
    function(err, password) {
      if (password && formdata.password === password){
        console.log(password);
        req.session.set('auth', formdata.username);
      }
      app.gettemplate(req, res, "base", null, password);
    });
}

// Show create form
function showCreate() {
  var req = this.req
    , res = this.res;
  app.gettemplate(req, res, "create");
}

// Show create form with old data
function updateCreate(pagename) {
  var req = this.req
    , res = this.res;
  console.log(pagename);
  app.redisClient.get(pagename,
    function(err, redisdata) {
      if(err) throw err;
      if(redisdata===null) {
        app.gettemplate(req, res, "create");
             }
      else {
        console.log("redisdata=" + redisdata);
        app.gettemplate(req, res, "create", pagename, redisdata);
      }
    });
}

// Show a list of all available pages
function showUpdate() {
  var req = this.req
    , res = this.res;
  app.redisClient.zrange("allpages", 0 ,-1 ,
    function(err, redisdata) {
      if(err) throw err;
      app.gettemplate(req, res, "base", null, redisdata);
      console.log(redisdata);
    });
}

// Send formdata to redis
function postUpdate() {
  var req = this.req
    , formdata = req.body
    , res = this.res;
  app.redisClient.set(formdata.pagename, formdata.pagecontent,
    function(err, redisdata) {
      console.log(redisdata);
      app.gettemplate(req, res, "base", null, redisdata);
    });
  app.redisClient.zadd(["allpages", 0, formdata.pagename],
    function(err, redisdata) {
      console.log(redisdata);
    });
}

// Delete page from redis
function deletePage(pagename) {
  var req = this.req
    , res = this.res;
  app.redisClient.del(pagename,
    function(err, redisdata) {
      console.log(redisdata);
      app.gettemplate(req, res, "base", pagename, redisdata);
    });
  app.redisClient.zrem(["allpages", pagename],
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

module.exports.showIndex = showIndex;
module.exports.showAdmin = showAdmin;
module.exports.showCreate= showCreate;
module.exports.deletePage= deletePage;
module.exports.show404= show404;
module.exports.updateCreate= updateCreate;
module.exports.showUpdate= showUpdate;
module.exports.postUpdate= postUpdate;
module.exports.showLogin= showLogin;
module.exports.postLogin= postLogin;
module.exports.showPage= showPage;
