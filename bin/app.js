#!/usr/bin/env node
// TODO: Replace all config strings in /bin and put them in /bin/config.js
'use strict';

var http = require('http')
  , flatiron = require('flatiron')
  , director = require('director')
  , union = require('union')
  , redis = require('redis')
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , app = flatiron.app
  , winston = require('winston')
  , redsess = require('redsess')
  , cookies = require('cookies')
  , keygrip = require('keygrip')
  , routes = require('./routes')
  , controller = require('./controller');

var logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'somefile.log' })
      ]
    });

var etags = {};

// Connect to redis db
redisClient.auth(process.env.redissecret);

// Use flatiron http server combo (director/union)
app.use(flatiron.plugins.http, {
  onError:controller.show404,
  before: [removePoweredBy, redSession, checkETag]
});

function checkETag (req, res) {
  if(req.url.slice(0, 6)==='/admin') {
    res.emit('next');
  }
  else if (etags[req.url] && req.headers['if-none-match'] === etags[req.url]) {
    res.statusCode = 304;
    res.end();
  }
  else {
    res.emit('next');
  }
}

function removePoweredBy(req, res) {
  res.removeHeader('X-Powered-By');
  res.emit('next');
}

// Test whether the incoming request has a valid session and set
// req.session.legit to true/false
function redSession (req, res) {
  var session = new redsess(req, res, {
    cookieName: "s",
    expire: 400, // default = 2 weeks
    client: redisClient, // defaults to RedSess.client
    keys: [ "this is a string key" ] // will be made into a keygrip obj
  });
  req.session = session;
  res.session = session;

  req.session.get('auth', function (err, auth) {
    if(err) throw err; // This should catch errors in the future
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
  dir : __dirname + "/../public",
  url : "public/"
});

// Inject routing table
app.router.mount(routes);
app.start(8080);
console.log('union with director running on 8080');

module.exports.redisClient = redisClient;
module.exports.logger = logger;
module.exports.etags = etags;

