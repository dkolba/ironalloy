// TODO: Cache-Control needs to get removed for /admin routes
'use strict';

var fs = require('fs')
  , plates = require('plates')
  , crypto = require('crypto')
  , dishwasher = require('dishwasher')
  , mappings = require('./mappings')
  , services = require('./services')
  , ironalloy = require('./ironalloy');

// Load templates
dishwasher.setFolder('../templates/', __dirname);

function renderView(req, res, pageobj, finalarray, mappings) {
  var hypertext = dishwasher.rinse(pageobj, finalarray, mappings.pagemap,
    mappings.singlemap, mappings.multimap);

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
      "Cache-Control": ironalloy.app.config.get('cache_control')
    });
    res.end(hypertext);
  }
}

module.exports.renderView = renderView;

