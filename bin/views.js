'use strict';

var fs = require('fs')
  , plates = require('plates')
  , rinse = require('dishwasher').rinse
  , mappings = require('./mappings')
  , services = require('./services')
  , zlib = require('zlib');

function renderView(req, res, pageobj, finalarray, mappings) {
  var hypertext = rinse(pageobj, finalarray, mappings)
    , etag = services.setETag(req, res, hypertext);
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
    services.setCache(req, res, buffer, 'gzip');
  });

  services.setCache(req, res, hypertext, 'identity');
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

function renderXML (res, xml) {
  res.writeHead(200, {"Content-Type:": "text/xml"});
  res.end(xml);
}

module.exports.renderView = renderView;
module.exports.rubberStampView = rubberStampView;
module.exports.renderXML = renderXML;

