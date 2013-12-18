'use strict';

var redis = require('redis')
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , redsess = require('redsess')
  , cookies = require('cookies')
  , keygrip = require('keygrip');

var etags = {};

// Connect to redis db
redisClient.auth(process.env.redissecret);

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

module.exports.redisClient = redisClient;
module.exports.checkETag = checkETag;
module.exports.etags = etags;
module.exports.removePoweredBy = removePoweredBy;
module.exports.redSession = redSession;

