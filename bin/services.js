'use strict';

var redis = require('redis')
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , redsess = require('redsess')
  , cookies = require('cookies')
  , keygrip = require('keygrip')
  , ironalloy = require('./ironalloy');

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
    cookieName: ironalloy.app.config.get('cookie_name'),
    expire: ironalloy.app.config.get('cookie_expire'),
    client: redisClient, // defaults to RedSess.client
    keys: [ ironalloy.app.config.get('keygrip') ] // this becomes a keygrip obj
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

function cacheControl (url) {
  if(url.slice(0, 6)==='/admin') {
    return "private, max-age=0, no-cache";
  }
  else {
    return ironalloy.app.config.get('cache_control');
  }
}

function purifyArray (array) {
  //Iterate over array and trim white space from strings
  for (var i = 0; i < array.length; i++) {
    if(typeof array[i] === 'string')
      array[i] = array[i].trim();
  }

  //Remove all instances of null, empty strings etc. form array
  array = array.filter(function(n){return n});

  return array
}

module.exports.redisClient = redisClient;
module.exports.checkETag = checkETag;
module.exports.etags = etags;
module.exports.removePoweredBy = removePoweredBy;
module.exports.redSession = redSession;
module.exports.cacheControl = cacheControl;
module.exports.purifyArray = purifyArray;

