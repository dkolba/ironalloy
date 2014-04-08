'use strict';
// TODO: Check if gzipped data is already cached
// TODO: Check if file is above 860 byte so gzipping makes a difference

var redis = require('redis')
  , redisClient = redis.createClient(process.env.redisport, process.env.host)
  , redisBufferClient = redis.createClient(process.env.redisport,
      process.env.host, {detect_buffers: true})
  , redsess = require('redsess')
  , cookies = require('cookies')
  , crypto = require('crypto')
  , keygrip = require('keygrip')
  , Negotiator = require('negotiator')
  , views = require('./views')
  , ironalloy = require('./ironalloy');

// Connect to redis db
redisClient.auth(process.env.redissecret);

function setETag (req, hypertext) {
  var etag = crypto.createHash('md5').update(hypertext).digest('hex');

  if (req.method === 'GET') {
    redisClient.set('etag:' + req.url, etag);
    console.log('saved etag for ', req.url);
    return etag;
  }
}

function checkETag (req, res) {
  var entrypoint = req.url.split('/')[1];

  // If admin interface or static file server are concerned, send no 301
  if  (entrypoint === 'admin' || entrypoint === 'public' ||
         entrypoint === 'login' || entrypoint === 'logout') {
    console.log('admin seiten kriegen kein etag');
    res.emit('next');
  }

  else {
    redisClient.get('etag:' + req.url, function(err, etag) {
      req.etag = etag;
      if (etag && req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        res.end();
        console.log('sent 304 for ', req.url);
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
  var entrypoint = req.url.split('/')[1];

  if (entrypoint !== 'admin' && entrypoint !== 'public' &&
        entrypoint !== 'login' && entrypoint !== 'logout') {
    console.log('Saved ' + encoding + ' cache for ' + req.url );
    redisClient.set('cache:' + req.url + ':' + encoding, hypertext);
  }

}

function getCache (req, res) {
  var availableEncodings = ['identity', 'gzip']
    , negotiator = new Negotiator(req)
    , entrypoint = req.url.split('/')[1];

  if (req.method !== 'GET') {
    res.emit('next');
    return;
  }

  if (req.etag) {
    console.log('checkCache etag: ', req.etag);
    res.setHeader('ETag', req.etag);
  }

  // Append preferred encoding to request for later use
  req.prefenc = negotiator.encoding(availableEncodings);

  // If admin interface or static file server are concerned, send no 304
  if (entrypoint === 'admin' || entrypoint === 'public' ||
        entrypoint === 'login' || entrypoint === 'logout') {
    res.emit('next');
  }
  else {
    // Fetch cached html or gzip data from redis as buffer
    redisBufferClient.get(new Buffer('cache:' + req.url + ':' + req.prefenc), function (err, html) {
      if (html) {
        views.rubberStampView(req, res, html);
        console.log('sent cached ' +  req.prefenc + ' for ', req.url);
      }
      else {
        res.emit('next');
      }
    });
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

function invalidateCache () {
  redisClient.zrange('allpages', 0, -1, function(err, allpages) {
    var multi = redisClient.multi();

    allpages[allpages.indexOf('index')] = '';
    for (var i = 0; i < allpages.length; i++) {
      multi.del('cache:/' + allpages[i] + ':identity');
      multi.del('cache:/' + allpages[i] + ':gzip');
      multi.del('etag:/' + allpages[i]);
    }

    multi.exec();
  });
}

module.exports.redisClient = redisClient;
module.exports.checkETag = checkETag;
module.exports.removePoweredBy = removePoweredBy;
module.exports.redSession = redSession;
module.exports.cacheControl = cacheControl;
module.exports.purifyArray = purifyArray;
module.exports.getCache = getCache;
module.exports.setCache = setCache;
module.exports.setETag = setETag;
module.exports.invalidateCache = invalidateCache;
