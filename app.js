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
  , keygrip = require('keygrip')
  , routes = require("./routes")
  , controller = require("./controller");

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
  onError:controller.show404,
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

// Inject routing table
app.router.mount(routes);
app.start(8080);
console.log('union with director running on 8080');

module.exports.redisClient = redisClient;
module.exports.gettemplate = gettemplate;
module.exports.logger = logger;
