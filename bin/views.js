'use strict';

var fs = require('fs')
  , plates = require('plates')
  , rinse = require('dishwasher').rinse
  , mappings = require('./mappings')
  , services = require('./services')
  , zlib = require('zlib');

function renderView(req, res, pageobj, finalarray, mappings) {
  var hypertext = rinse(pageobj, finalarray, mappings)
    , etag = services.setETag(req, hypertext);
  if(etag) {
    res.setHeader('ETag', etag);
  }
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', services.cacheControl(req.url));

  if (req.prefenc === 'identity') {
    rubberStampView(req, res, hypertext);
  }

  zlib.gzip(hypertext, function (err, buffer) {
    if(req.prefenc === 'gzip') {
      rubberStampView(req, res, buffer);
    }
    services.setCache(req, buffer, 'gzip');
  });

  services.setCache(req, hypertext, 'identity');
}


function rubberStampView (req, res, hypertext) {
  res.writeHead(res.statusCode || 200, {
    "Content-Type": "text/html",
    "Content-Length": hypertext.length,
    "content-encoding": req.prefenc,
    "Cache-Control": services.cacheControl(req.url)
  });
  res.end(hypertext);
}


function renderView2(req, res, pageobj, finalarray, mappings) {
  var hypertext = rinse(pageobj, finalarray, mappings);

  services.setETag(req, hypertext);

  if (res.statusCode === 404) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('etag', services.etags[req.url]);
    res.end(hypertext);
  }
  else {
    // res.writeHead(200, {
    //   "Content-Type": "text/html",
    //   "ETag": services.etags[req.url],
    //   "Cache-Control": services.cacheControl(req.url)
    // });
    // console.log(Buffer.byteLength(hypertext, 'utf8') + " bytes");
    zlib.gzip(hypertext, function(err, buffer) {
        res.writeHead(200, {
          "Content-Type": "text/html",
          'content-encoding': 'gzip',
          "ETag": services.etags[req.url],
          "Cache-Control": services.cacheControl(req.url)
        });
      res.end(buffer);
    });
  // res.end(hypertext);
  }
}
module.exports.renderView = renderView;
module.exports.rubberStampView = rubberStampView;

