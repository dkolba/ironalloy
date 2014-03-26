'use strict';
// TODO: Check if gzipped data is already cached
// TODO: Check if file is above 860 byte so gzipping makes a difference

var redis = require('redis')
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , redsess = require('redsess')
  , cookies = require('cookies')
  , crypto = require('crypto')
  , keygrip = require('keygrip')
  , Negotiator = require('negotiator')
  , views = require('./views')
  , ironalloy = require('./ironalloy');

var etags = {};

// Connect to redis db
redisClient.auth(process.env.redissecret);

function setETag (req, hypertext) {
  var etag = (crypto.createHash('md5')
                     .update(hypertext, 'utf8')
                     .digest('hex'))
                     .toString();
  // redisClient.set('etag:' + req.url, etag, ironalloy.app.log.info);
  // redisClient.set('etag:' + req.url, etag, redis.print);
  redisClient.set('etag:' + req.url, etag, ironalloy.app.log.info);
  return etag;
}

function checkETag (req, res) {
  var entrypoint = req.url.split('/')[1];

  // If admin interface or static file server are concerned, send no 301
  if  (entrypoint === 'admin' || entrypoint === 'public') {
    res.emit('next');
  }
  else {
    redisClient.get('etag:' + req.url, function(err, etag) {
      req.etag = etag;
      if (etag && req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        res.end();
      }
      else {
        // if (etag) res.setHeader('ETag',  etag);
        res.emit('next');
      }
    });
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

function setCache (req, hypertext, encoding) {
  redisClient.set('cache:' + req.url + ':' + encoding, hypertext,
    ironalloy.app.log.info);
}

function getCache (req, res) {
  var availableEncodings = ['identity', 'gzip']
    , negotiator = new Negotiator(req)
    , entrypoint = req.url.split('/')[1];

  if (req.etag) {
    res.setHeader('ETag', req.etag);
  }

  // Append preferred encoding to request for later use
  req.prefenc = negotiator.encoding(availableEncodings);

  // If admin interface or static file server are concerned, send no 304
  if (entrypoint === 'admin' || entrypoint === 'public') {
    res.emit('next');
  }
  else {
    // Fetch cached html or gzip data from redis
    redisClient.get('cache:' + req.url + ':' + req.prefenc, function (err, html) {
      if (html) {
        console.log(html);
        views.rubberStampView(req, res, html);
      }
      else {
        res.emit('next');
      }
    });
    console.log(negotiator.encoding(availableEncodings));
  }
}

function purifyArray (array) {
  //Iterate over array and trim white space from strings
  for (var i = 0; i < array.length; i++) {
    if(typeof array[i] === 'string')
      array[i] = array[i].trim();
  }

  //Remove all instances of null, empty strings etc. form array
  array = array.filter(function(n){return n;});

  return array;
}

module.exports.redisClient = redisClient;
module.exports.checkETag = checkETag;
module.exports.etags = etags;
module.exports.removePoweredBy = removePoweredBy;
module.exports.redSession = redSession;
module.exports.cacheControl = cacheControl;
module.exports.purifyArray = purifyArray;
module.exports.getCache = getCache;
module.exports.setCache = setCache;
module.exports.setETag = setETag;
