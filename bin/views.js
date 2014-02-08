'use strict';

var fs = require('fs')
  , plates = require('plates')
  , crypto = require('crypto')
  , rinse = require('dishwasher').rinse
  , mappings = require('./mappings')
  , services = require('./services');

function renderView(req, res, pageobj, finalarray, mappings) {
  var hypertext = rinse(pageobj, finalarray, mappings);

  services.etags[req.url] = (crypto.createHash('md5')
                              .update(hypertext, 'utf8')
                              .digest('hex'))
                              .toString();

  if (res.statusCode === 404) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('etag', services.etags[req.url]);
    res.end(hypertext);
  }
  else {
    res.writeHead(200, {
      "Content-Type": "text/html",
      "ETag": services.etags[req.url],
      "Cache-Control": services.cacheControl(req.url)
    });
    res.end(hypertext);
  }
}

module.exports.renderView = renderView;

